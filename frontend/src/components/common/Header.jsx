import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '@3rdweb/hooks';
import styled from 'styled-components';
import { useBlockchain } from '../../contexts/BlockchainContext';
import Logo from '../../assets/logo.svg';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 5%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: ${({ $mobileOpen }) => $mobileOpen ? 'flex' : 'none'};
    flex-direction: column;
    width: 100%;
    order: 3;
    padding-top: 1rem;
  }
`;

const WalletStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  position: relative;

  span {
    color: ${({ $connected }) => $connected ? '#4CAF50' : '#ff5252'};
  }
`;

const NetworkIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ $status }) => 
    $status === 'connected' ? '#4CAF50' :
    $status === 'error' ? '#ff5252' : '#ffeb3b'};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Header = () => {
  const { connectWallet, address, error } = useWeb3();
  const { networkStatus, notifications } = useBlockchain();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const truncateAddress = (addr) => 
    `${addr?.slice(0, 6)}...${addr?.slice(-4)}`;

  const getNetworkStatus = () => {
    if (error) return 'error';
    return networkStatus === 'synced' ? 'connected' : 'connecting';
  };

  return (
    <HeaderContainer>
      <Link to="/">
        <img src={Logo} alt="Disaster Response" height="40" />
      </Link>

      <MobileMenuButton onClick={() => setIsMobileOpen(!isMobileOpen)}>
        ☰
      </MobileMenuButton>

      <NavLinks $mobileOpen={isMobileOpen}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/map" className={location.pathname === '/map' ? 'active' : ''}>
          Live Map
        </Link>
        <Link to="/report" className={location.pathname === '/report' ? 'active' : ''}>
          Report Emergency
        </Link>
        <Link to="/resources" className={location.pathname === '/resources' ? 'active' : ''}>
          Resources
        </Link>
      </NavLinks>

      <WalletStatus $connected={!!address}>
        <NetworkIndicator $status={getNetworkStatus()} />
        {address ? (
          <>
            <span>{truncateAddress(address)}</span>
            <div className="notifications">
              🔔 {notifications.length}
            </div>
          </>
        ) : (
          <button onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </WalletStatus>
    </HeaderContainer>
  );
};

export default Header;
