import React from 'react';
import btn_next from '../assets/btn_next.svg';
import { COLORS } from '../styles/theme';

interface BtnNextProps {
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}

const BtnNext: React.FC<BtnNextProps> = ({
  onClick,
  disabled = false,
  ariaLabel,
  style,
  buttonStyle,
  imgStyle,
}) => {
  const defaultButtonStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.3 : 1,
    flexShrink: 0,
    ...buttonStyle,
  };

  const defaultImgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    filter: `brightness(0) saturate(100%) invert(31%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)`,
    color: COLORS.textSecondary,
    ...imgStyle,
    ...style,
  };

  if (onClick !== undefined) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={defaultButtonStyle}
        aria-label={ariaLabel}
      >
        <img src={btn_next} alt="next" style={defaultImgStyle} />
      </button>
    );
  }

  return <img src={btn_next} alt="next" style={defaultImgStyle} />;
};
export default BtnNext;
