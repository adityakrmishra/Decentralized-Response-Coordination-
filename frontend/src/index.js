import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { Web3Provider } from '@3rdweb/react';
import { StrictMode } from 'react/cjs/react.production.min';
import { disableReactDevTools } from '@fvilers/disable-react-devtools';
import { configure as configureWebAnalytics } from 'react-ga';
import { createWeb3Modal } from '@web3modal/react';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { register } from 'register-service-worker';
import { Buffer } from 'buffer';
import App from './App';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { version } from '../package.json';
import './assets/styles/main.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// Polyfill for Node.js Buffer in browser
if (typeof window.Buffer === 'undefined') {
  window.Buffer = Buffer;
}

// Error Tracking Setup
if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [
      new BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation
      }),
      new Sentry.Replay()
    ],
    release: `disaster-response@${version}`,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    attachStacktrace: true,
    normalizeDepth: 5,
    beforeSend(event) {
      if (event.exception) {
        console.error('Sentry captured error:', event);
      }
      return event;
    }
  });
}

// Performance Monitoring
if (process.env.REACT_APP_ENABLE_PERF_MONITORING) {
  import('react-axe').then(axe => {
    axe.default(React, require('react-dom'), 1000);
  });
}

// Web3 Modal Configuration
createWeb3Modal({
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
  theme: 'dark',
  accentColor: 'default',
  ethereum: {
    appName: 'DisasterResponse',
    chains: [Number(process.env.REACT_APP_CHAIN_ID)],
    providers: [
      {
        name: 'Injected',
        connector: injectedProvider => ({
          web3: async () => new Web3Provider(injectedProvider)
        })
      }
    ]
  }
});

// Google Analytics
if (process.env.REACT_APP_GA_TRACKING_ID) {
  configureWebAnalytics(process.env.REACT_APP_GA_TRACKING_ID, {
    gaOptions: {
      siteSpeedSampleRate: 100,
      cookieDomain: 'auto',
      allowLinker: true
    }
  });
}

// Disable React DevTools in production
if (process.env.NODE_ENV === 'production') {
  disableReactDevTools();
}

// Environment Checks
const requiredEnvVars = [
  'REACT_APP_CHAIN_ID',
  'REACT_APP_MAPBOX_TOKEN',
  'REACT_APP_RESOURCE_ALLOCATION_ADDR'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(
        new Error(`Missing environment variable: ${varName}`)
      );
    }
  }
});

// Service Worker Registration
const swConfig = {
  ready(registration) {
    console.log('Service worker is active.');
  },
  registered(registration) {
    console.log('Service worker has been registered.');
  },
  cached(registration) {
    console.log('Content has been cached for offline use.');
  },
  updatefound(registration) {
    console.log('New content is downloading.');
  },
  updated(registration) {
    console.log('New content is available; please refresh.');
    if (window.confirm('New version available! Update now?')) {
      window.location.reload();
    }
  },
  offline() {
    console.log('No internet connection found. App is running in offline mode.');
  },
  error(error) {
    console.error('Error during service worker registration:', error);
    Sentry.captureException(error);
  }
};

// Progressive Web App Setup
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  register(`${process.env.PUBLIC_URL}/service-worker.js`, swConfig);
  defineCustomElements(window);
}

// Global Error Handling
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  Sentry.captureException(error || message);
};

window.onunhandledrejection = function(event) {
  console.error('Unhandled rejection:', event.reason);
  Sentry.captureException(event.reason);
};

// Web Vitals Reporting
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Root Component Render
const container = document.getElementById('root');
const root = createRoot(container);

function renderApp() {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Web3Provider
          supportedChainIds={[Number(process.env.REACT_APP_CHAIN_ID)]}
          connectorOverrides={{
            injected: {
              display: {
                name: 'Browser Wallet',
                description: 'Connect with your browser wallet'
              }
            }
          }}
        >
          <HelmetProvider>
            <ThemeProvider>
              <BlockchainProvider>
                <App />
              </BlockchainProvider>
            </ThemeProvider>
          </HelmetProvider>
        </Web3Provider>
      </ErrorBoundary>
    </StrictMode>
  );
}

// Initialization Sequence
try {
  if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      logOnDifferentValues: true
    });
  }

  if (window.cordova) {
    document.addEventListener('deviceready', renderApp, false);
  } else {
    renderApp();
  }

  if (module.hot) {
    module.hot.accept('./App', renderApp);
  }
} catch (error) {
  console.error('Initialization failed:', error);
  Sentry.captureException(error);
  root.render(
    <div className="critical-error">
      <h1>Application Failed to Initialize</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}

// Export for SSR hydration
export { renderApp, reportWebVitals };
