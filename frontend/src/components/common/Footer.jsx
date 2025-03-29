import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTwitter, 
  faGithub, 
  faTelegram 
} from '@fortawesome/free-brands-svg-icons';

const FooterContainer = styled.footer`
  background: #0a1929;
  color: white;
  padding: 3rem 5%;
  margin-top: auto;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .footer-section {
    h4 {
      color: #4CAF50;
      margin-bottom: 1rem;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        margin: 0.5rem 0;
        
        a {
          color: #bdbdbd;
          text-decoration: none;
          transition: color 0.3s;

          &:hover {
            color: #4CAF50;
          }
        }
      }
    }
  }

  .social-links {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;

    a {
      font-size: 1.5rem;
      color: #bdbdbd;
      transition: color 0.3s;

      &:hover {
        color: #4CAF50;
      }
    }
  }

  .copyright {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #333;
  }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <div className="footer-content">
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/map">Live Emergency Map</a></li>
            <li><a href="/report">Submit Report</a></li>
            <li><a href="/resources">Response Resources</a></li>
            <li><a href="/transparency">Supply Tracking</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <ul>
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/whitepaper">Technical Docs</a></li>
            <li><a href="/api-docs">Developer API</a></li>
            <li><a href="/security">Security Audit</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>Emergency Hotline: 1-800-RESPOND</li>
            <li>Email: support@disasterchain.org</li>
            <li>Press Inquiries: press@disasterchain.org</li>
          </ul>
          <div className="social-links">
            <a href="https://twitter.com/disasterchain">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="https://github.com/disasterchain">
              <FontAwesomeIcon icon={faGithub} />
            </a>
            <a href="https://t.me/disasterchain">
              <FontAwesomeIcon icon={faTelegram} />
            </a>
          </div>
        </div>
      </div>

      <div className="copyright">
        © {new Date().getFullYear()} Decentralized Response Coordination Platform.
        <br />
        Open Source (MIT License) - Contribute on GitHub
      </div>
    </FooterContainer>
  );
};

export default Footer;
