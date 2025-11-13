import type { CSSProperties, FunctionComponent } from 'react';
import { COLORS } from '../styles/theme';

/**
 * FooterCopyright
 * 고정 하단 영역에 저작권 문구만 표시하는 푸터
 */
const FooterCopyright: FunctionComponent = () => {
  const styles: { [key: string]: CSSProperties } = {
    footer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '8px 27px',
      boxSizing: 'border-box',
      backgroundColor: '#f8f6f7',
      color: '#313131',
      fontFamily: 'Pretendard',
      fontSize: '12px',
      zIndex: 100,
    },
    text: {
      opacity: 0.8,
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.text}>© {currentYear} SayJong. All rights reserved.</div>
    </footer>
  );
};

export default FooterCopyright;
