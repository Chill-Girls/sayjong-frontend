import type { CSSProperties, FunctionComponent } from 'react';

/**
 * Footer 컴포넌트
 * 이전/다음 네비게이션 버튼이 있는 하단 고정 푸터
 */
const Footer: FunctionComponent = () => {
  const styles: { [key: string]: CSSProperties } = {
    footer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 27px', // 36px × 0.75
      boxSizing: 'border-box',
      fontSize: '14.25px', // 19px × 0.75
      color: '#f04299',
      fontFamily: 'Pretendard',
      zIndex: 100,
      backgroundColor: '#f8f6f7',
    },
    prev: {
      borderRadius: '9px', // 12px × 0.75
      backgroundColor: '#ffe9f4',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 24px',
      boxSizing: 'border-box',
      cursor: 'pointer',
      fontSize: '16px',
    },
    labelWrapper: {
      display: 'flex',
      alignItems: 'flex-end',
    },
    label: {
      position: 'relative',
    },
    next: {
      borderRadius: '9px', // 12px × 0.75
      backgroundColor: '#f04299',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px 24px',
      boxSizing: 'border-box',
      minWidth: '100px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '16px',
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={{ ...styles.labelWrapper, width: '100%', justifyContent: 'flex-end' }}>
        <div style={styles.label}>next</div>
      </div>
    </footer>
  );
};

export default Footer;
