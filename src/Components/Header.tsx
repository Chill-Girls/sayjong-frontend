import type { CSSProperties, FunctionComponent } from 'react';
import accountIcon from '../assets/account_circle.svg';

interface HeaderProps {
  currentPage?: 'home' | 'lesson' | 'history';
  onNavigate?: (page: 'home' | 'lesson' | 'history') => void;
}

const Header: FunctionComponent<HeaderProps> = ({ currentPage = 'home', onNavigate }) => {
  const styles: { [key: string]: CSSProperties } = {
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '55.5px',
      backgroundColor: '#f8f6f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 27px',
      boxSizing: 'border-box',
      fontSize: '24px',
      color: '#1e1e1e',
      fontFamily: 'Pretendard',
      zIndex: 100,
    },
    sayjong: {
      fontWeight: 600,
    },
    navigation: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
      fontSize: '15px',
      color: '#313131',
    },
    navItem: {
      position: 'relative',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
    },
    accountCircleIcon: {
      width: '37.5px',
      height: '37.5px',
      objectFit: 'contain',
    },
  };

  const getNavItemStyle = (page: 'home' | 'lesson' | 'history'): CSSProperties => ({
    ...styles.navItem,
    color: currentPage === page ? '#f04299' : '#313131',
    fontWeight: currentPage === page ? 600 : 400,
  });

  return (
    <header style={styles.header}>
      <div style={styles.sayjong}>SayJong</div>

      <nav style={styles.navigation}>
        <div style={getNavItemStyle('home')} onClick={() => onNavigate?.('home')}>
          Home
        </div>
        <div style={getNavItemStyle('lesson')} onClick={() => onNavigate?.('lesson')}>
          Lesson
        </div>
        <div style={getNavItemStyle('history')} onClick={() => onNavigate?.('history')}>
          History
        </div>
      </nav>

      <img style={styles.accountCircleIcon} alt="Account Icon" src={accountIcon} />
    </header>
  );
};

export default Header;
