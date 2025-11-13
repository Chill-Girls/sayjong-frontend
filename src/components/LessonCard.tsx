import type { CSSProperties, FunctionComponent } from 'react';
import { COLORS } from '../styles/theme';

interface LessonCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  iconSrc?: string;
}

const LessonCard: FunctionComponent<LessonCardProps> = ({
  title = 'Syllable',
  subtitle = 'Lesson',
  description = 'Master each sound',
  iconSrc,
}) => {
  const styles: { [key: string]: CSSProperties } = {
    container: {
      height: '14.0625rem',
      position: 'relative',
      boxShadow: '0rem 0.1875rem 0.1875rem rgba(0, 0, 0, 0.25)',
      borderRadius: '1.40625rem',
      backgroundColor: '#fff',
      width: '100%',
      maxWidth: '17.5rem',
      minWidth: '13.75rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem 0.875rem',
      boxSizing: 'border-box',
      gap: '0.75rem',
      textAlign: 'center',
      fontSize: '1.25rem',
      color: '#000',
      fontFamily: 'Pretendard',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    scriptIcon: {
      width: '3.125rem',
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
      color: COLORS.dark,
    },
    subtitle: {
      position: 'relative',
      fontWeight: 600,
      margin: 0,
      color: COLORS.dark,
    },
    description: {
      position: 'relative',
      fontSize: '0.8rem',
      fontWeight: 400,
      color: COLORS.textSecondary,
      margin: 0,
    },
  };

  return (
    <div
      style={styles.container}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-0.25rem)';
        e.currentTarget.style.boxShadow = '0rem 0.375rem 0.375rem rgba(0, 0, 0, 0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0rem 0.1875rem 0.1875rem rgba(0, 0, 0, 0.25)';
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
