import type { CSSProperties, FunctionComponent } from 'react';

interface LessonCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  iconSrc?: string;
}

const LessonCard: FunctionComponent<LessonCardProps> = ({ 
  title = "Syllable",
  subtitle = "Lesson",
  description = "Master each sound",
  iconSrc
}) => {
  const styles: { [key: string]: CSSProperties } = {
    container: {
      height: '225px', 
      position: 'relative',
      boxShadow: '0px 3px 3px rgba(0, 0, 0, 0.25)', // 4px × 0.75
      borderRadius: '22.5px', // 30px × 0.75
      backgroundColor: '#fff',
      width: '100%',
      maxWidth: '280px',
      minWidth: '220px', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 14px', 
      boxSizing: 'border-box',
      gap: '12px', // 더 작은 간격
      textAlign: 'center',
      fontSize: '20px', // 더 작은 폰트
      color: '#000',
      fontFamily: 'Pretendard',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    scriptIcon: {
      width: '50px', // 아이콘 크기 증가
      position: 'relative',
      maxHeight: '100%',
      objectFit: 'contain',
    },
    titleContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0',
    },
    title: {
      position: 'relative',
      fontWeight: 600,
      margin: 0,
    },
    subtitle: {
      position: 'relative',
      fontWeight: 600,
      margin: 0,
    },
    description: {
      position: 'relative',
      fontSize: '12px', // 더 작은 설명 텍스트
      fontWeight: 300,
      color: '#636364',
      margin: 0,
    },
  };

  return (
    <div 
      style={styles.container}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0px 6px 6px rgba(0, 0, 0, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0px 3px 3px rgba(0, 0, 0, 0.25)';
      }}
    >
      {iconSrc && <img style={styles.scriptIcon} src={iconSrc} alt="" />}
      <div style={styles.titleContainer}>
        <div style={styles.title}>{title}</div>
        <div style={styles.subtitle}>{subtitle}</div>
      </div>
      <div style={styles.description}>{description}</div>
    </div>
  );
};

export default LessonCard;
