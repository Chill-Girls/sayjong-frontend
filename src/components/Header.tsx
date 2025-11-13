import type { CSSProperties, FunctionComponent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import accountIcon from '../assets/account_circle.svg';
import { useMode, MODE_LABEL } from '../constants/ModeContext';
import { COLORS } from '../styles/theme';

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
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
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
      fontSize: '24px',
      color: '#313131',
      justifySelf: 'center',
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
      filter:
        'brightness(0) saturate(100%) invert(27%) sepia(93%) saturate(1352%) hue-rotate(300deg) brightness(98%) contrast(95%)',
    },
    profileButton: {
      border: 'none',
      background: 'transparent',
      padding: 0,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      outline: 'none',
    },
    dropdownWrapper: {
      position: 'relative',
      justifySelf: 'end',
      display: 'flex',
      alignItems: 'center',
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 12px)',
      right: 0,
      backgroundColor: '#fff',
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
      borderRadius: 12,
      minWidth: 190,
      padding: '12px 0',
      zIndex: 101,
      border: '1px solid rgba(240, 66, 153, 0.12)',
    },
    dropdownItem: {
      fontFamily: 'Pretendard',
      fontSize: '16px',
      padding: '10px 20px',
      color: COLORS.textSecondary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      background: 'transparent',
      border: 'none',
      textAlign: 'left',
    },
    dropdownItemHover: {
      backgroundColor: 'rgba(240, 66, 153, 0.08)',
      color: '#f04299',
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
      fontWeight: isActive ? 600 : 600,
    };
  };

  const [logoPressed, setLogoPressed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { mode } = useMode();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path: string) => {
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const dropdownItems: Array<{
    label: string;
    onClick: () => void;
  }> = [
    { label: 'Calibration', onClick: () => handleNavigation('/calibration') },
    { label: 'Training Log', onClick: () => handleNavigation('/training-log') },
    { label: 'Log Out', onClick: handleLogout },
  ];

  return (
    <header style={styles.header}>
      <Link
        to="/home"
        style={{
          ...getNavItemStyle('/home', true),
          color: logoPressed ? '#1e1e1e' : '#1e1e1e',
        }}
        onMouseDown={() => setLogoPressed(true)}
        onMouseUp={() => setLogoPressed(false)}
        onMouseLeave={() => setLogoPressed(false)}
      >
        <span style={{ color: '#F04488', fontWeight: 'bold' }}>SAY</span>
        <span style={{ fontWeight: 'bold' }}>JONG</span>
      </Link>

      <nav style={styles.navigation}>
        {mode ? <div style={{ fontWeight: 600, color: '#f04299' }}>{MODE_LABEL[mode]}</div> : null}
      </nav>

      <div ref={dropdownRef} style={styles.dropdownWrapper}>
        <button
          type="button"
          style={styles.profileButton}
          onClick={() => setIsProfileMenuOpen(prev => !prev)}
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
        >
          <img style={styles.accountCircleIcon} alt="Profile menu" src={accountIcon} />
        </button>
        {isProfileMenuOpen ? (
          <div role="menu" style={styles.dropdown}>
            {dropdownItems.map(item => (
              <button
                key={item.label}
                type="button"
                style={styles.dropdownItem}
                onClick={item.onClick}
                onMouseEnter={event =>
                  Object.assign(event.currentTarget.style, styles.dropdownItemHover)
                }
                onMouseLeave={event => {
                  Object.assign(event.currentTarget.style, styles.dropdownItem);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
