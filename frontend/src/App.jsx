import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useWeb3 } from '@3rdweb/hooks';
import { ethers } from 'ethers';
import { ToastContainer, Slide } from 'react-toastify';
import { BlockchainProvider } from './contexts/BlockchainContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingOverlay from './components/common/LoadingOverlay';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import './assets/styles/main.scss';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet';
import { emergencyTypes } from './utils/constants';
import { handleCriticalError } from './utils/errorHandlers';
import { initAnalytics } from './utils/analytics';
import { useGeoLocation } from './hooks/useGeoLocation';
import { Web3Provider } from '@3rdweb/react';

// Lazy-loaded components
const MapPage = React.lazy(() => import('./pages/MapPage'));
const ReportPage = React.lazy(() => import('./pages/ReportPage'));
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const TransparencyPage = React.lazy(() => import('./pages/TransparencyPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const { provider } = useWeb3();
  const { coordinates, error: geoError } = useGeoLocation();
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [supplyChainUpdates, setSupplyChainUpdates] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      try {
        initAnalytics();
        await checkNetworkCompatibility();
        setupWebSocket();
        setIsInitialized(true);
      } catch (error) {
        handleCriticalError(error, setGlobalError);
      }
    };

    initializeApp();

    return () => {
      wsConnection?.close();
    };
  }, []);

  // Handle geolocation errors
  useEffect(() => {
    if (geoError) {
      handleCriticalError(
        new Error(`Geolocation Error: ${geoError.message}`), 
        setGlobalError
      );
    }
  }, [geoError]);

  // Check network compatibility
  const checkNetworkCompatibility = useCallback(async () => {
    if (!provider) return;
    
    try {
      const network = await provider.getNetwork();
      const supportedChainIds = process.env.REACT_APP_SUPPORTED_CHAINS.split(',').map(Number);
      
      if (!supportedChainIds.includes(network.chainId)) {
        throw new Error(`Unsupported network: ${network.name}. Please switch chains.`);
      }
    } catch (error) {
      throw new Error(`Network Error: ${error.message}`);
    }
  }, [provider]);

  // WebSocket setup
  const setupWebSocket = () => {
    const ws = new WebSocket(process.env.REACT_APP_WS_ENDPOINT);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnection(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'SUPPLY_UPDATE':
          setSupplyChainUpdates(prev => [...prev, data.payload]);
          break;
        case 'EMERGENCY_ALERT':
          setActiveEmergency(data.payload);
          break;
        default:
          console.warn('Unknown WS message type:', data.type);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnection(null);
    };

    ws.onerror = (error) => {
      handleCriticalError(new Error(`WebSocket Error: ${error.message}`), setGlobalError);
    };
  };

  // Error boundary fallback
  const ErrorFallback = ({ error, resetError }) => (
    <div className="error-fallback">
      <h2>Critical System Error</h2>
      <pre>{error.message}</pre>
      <button onClick={resetError}>Try to Recover</button>
    </div>
  );

  // Private route component
  const PrivateRoute = ({ children }) => {
    const { currentAccount } = useWeb3();
    return currentAccount ? children : <Navigate to="/" />;
  };

  if (globalError) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ErrorFallback 
          error={globalError} 
          resetError={() => {
            setGlobalError(null);
            window.location.reload();
          }}
        />
      </ErrorBoundary>
    );
  }

  return (
    <Web3Provider
      desiredChainId={Number(process.env.REACT_APP_CHAIN_ID)}
      supportedChainIds={[
        Number(process.env.REACT_APP_CHAIN_ID)
      ]}
      connectorOverrides={{
        injected: {
          display: {
            name: 'Browser Wallet',
            description: 'Connect with your browser extension wallet',
          },
        },
      }}
    >
      <ThemeProvider>
        <BlockchainProvider>
          <Helmet>
            <title>Decentralized Response Coordination Platform</title>
            <meta
              name="description"
              content="Blockchain-powered disaster response coordination and community engagement platform"
            />
          </Helmet>

          <Router>
            <div className="app-container">
              <Header />
              
              <Suspense fallback={<LoadingOverlay />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  
                  <Route
                    path="/map"
                    element={
                      <ErrorBoundary>
                        <MapPage
                          userCoordinates={coordinates}
                          activeEmergency={activeEmergency}
                          supplyUpdates={supplyChainUpdates}
                        />
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/report"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <ReportPage 
                            userCoordinates={coordinates}
                            emergencyTypes={emergencyTypes}
                          />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/resources"
                    element={
                      <ErrorBoundary>
                        <ResourcesPage />
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/transparency"
                    element={
                      <ErrorBoundary>
                        <TransparencyPage />
                      </ErrorBoundary>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <ErrorBoundary>
                          <ProfilePage />
                        </ErrorBoundary>
                      </PrivateRoute>
                    }
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>

              <Footer />

              <ToastContainer
                position="bottom-right"
                autoClose={5000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                transition={Slide}
              />
            </div>
          </Router>
        </BlockchainProvider>
      </ThemeProvider>
    </Web3Provider>
  );
};

export default App;
