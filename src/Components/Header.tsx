import type { CSSProperties, FunctionComponent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import accountIcon from '../assets/account_circle.svg';

type HeaderProps = Record<string, never>;

const Header: FunctionComponent<HeaderProps> = () => {
  const location = useLocation();
  const currentPath = location.pathname;

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
      color: 'inherit',
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
      textDecoration: 'none',
    },
    accountCircleIcon: {
      width: '37.5px',
      height: '37.5px',
      objectFit: 'contain',
    },
  };

  const getNavItemStyle = (path: string, exactMatch = false): CSSProperties => {
    let isActive = false;

    if (exactMatch) {
      isActive = currentPath === path;
    } else {
      isActive = currentPath.startsWith(path);
    }

    return {
      ...styles.navItem,
      color: isActive ? '#f04299' : '#313131',
      fontWeight: isActive ? 600 : 400,
    };
  };

  return (
    <header style={styles.header}>
      <Link to="/home" style={styles.sayjong}>
        SayJong
      </Link>

      <nav style={styles.navigation}>
        <Link to="/home" style={getNavItemStyle('/home', true)}>
          Home
        </Link>
        <Link to="/lesson" style={getNavItemStyle('/lesson')}>
          Lesson
        </Link>
        <Link to="/history" style={getNavItemStyle('/history')}>
          History
        </Link>
      </nav>

      <img style={styles.accountCircleIcon} alt="Account Icon" src={accountIcon} />
    </header>
  );
};

export default Header;
