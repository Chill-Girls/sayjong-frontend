import type { FunctionComponent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SejongImage from '../assets/Sejong.png';
import InputField from '../components/InputField';
import FooterCopyright from '../components/FooterCopyright';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import {
  containerCentered,
  flexColumn,
  buttonPrimary,
  buttonDisabled,
  logoSayJong,
  scaled,
} from '../styles/mixins';

type LoginProps = Record<string, never>;

interface LoginCredentials {
  id: string;
  password: string;
  nickname?: string;
}

const Login: FunctionComponent<LoginProps> = () => {
  const navigate = useNavigate();
  const { handleLogin, handleSignUp, isLoading, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    id: '',
    password: '',
    nickname: '',
  });
  const [rememberMe, setRememberMe] = useState(false);

  const onLogin = async () => {
    const result = await handleLogin({
      loginId: credentials.id,
      userPassword: credentials.password,
    });
    if (result.success) {
      navigate('/calibration');
    }
  };

  const onSignUp = async () => {
    const result = await handleSignUp({
      loginId: credentials.id,
      userPassword: credentials.password,
      nickname: credentials.nickname || '',
    });
    if (result.success) {
      setIsSignUp(false);
      setCredentials({ id: '', password: '', nickname: '' });
    }
  };

  const handleSubmit = () => {
    if (isSignUp) {
      onSignUp();
    } else {
      onLogin();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const toggleMode = () => {
    clearError();
    setIsSignUp(!isSignUp);
    setCredentials({ id: '', password: '', nickname: '' });
  };

  return (
    <div
      style={{
        ...containerCentered,
        padding: `${scaled(66)} ${scaled(108)}`,
        gap: scaled(141),
        textAlign: 'left',
        fontSize: FONT_SIZES.xxl,
        color: COLORS.dark,
        fontFamily: FONTS.primary,
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: scaled(60),
          minWidth: scaled(1100),
          maxWidth: scaled(1200),
          zIndex: 0,
          position: 'relative',
        }}
      >
        {/* 세종대왕 이미지 */}
        <div
          style={{
            flex: 0.9662,
            display: 'flex',
            alignItems: 'flex-start',
            padding: scaled(10),
            marginLeft: scaled(-100),
            marginTop: scaled(10),
          }}
        >
          <img
            src={SejongImage}
            style={{
              flex: 1,
              position: 'relative',
              maxWidth: '100%',
              overflow: 'hidden',
              maxHeight: '100%',
              objectFit: 'cover',
            }}
            alt="Sejong"
          />
        </div>

        {/* 폼 영역 */}
        <div
          style={{
            flex: 1,
            ...flexColumn,
            alignItems: 'flex-start',
            gap: scaled(50),
            position: 'relative',
            marginTop: scaled(90),
          }}
        >
          {/* SayJong 로고 */}
          <div
            style={{
              ...logoSayJong,
              position: 'absolute',
              top: scaled(-80),
              left: 0,
            }}
          >
            <span>SAY</span>
            <span style={{ color: COLORS.dark }}>JONG</span>
          </div>
          {/* 타이틀 */}
          <div
            style={{
              alignSelf: 'stretch',
              ...flexColumn,
              alignItems: 'flex-start',
              gap: scaled(20),
            }}
          >
            
            <div
              style={{
                position: 'relative',
                fontSize: FONT_SIZES.base,
                opacity: 0.75,
              }}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>
                {isSignUp
                  ? 'Create an account to learn Korean with KPOP songs!'
                  : 'Login to learn Korean with KPOP songs!'}
              </span>
            </div>
          </div>

          {/* 입력 필드들 */}
          <div
            style={{
              alignSelf: 'stretch',
              ...flexColumn,
              alignItems: 'flex-start',
              gap: scaled(30),
              fontSize: FONT_SIZES.base,
              color: COLORS.textLight,
              fontFamily: FONTS.secondary,
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                ...flexColumn,
                alignItems: 'flex-start',
                gap: scaled(25),
              }}
            >
              <InputField
                type="text"
                value={credentials.id}
                onChange={value => setCredentials(prev => ({ ...prev, id: value }))}
                onKeyDown={handleKeyDown}
                label="ID"
                disabled={isLoading}
              />

              {isSignUp && (
                <InputField
                  type="text"
                  value={credentials.nickname || ''}
                  onChange={value => setCredentials(prev => ({ ...prev, nickname: value }))}
                  onKeyDown={handleKeyDown}
                  label="Nickname"
                  disabled={isLoading}
                />
              )}

              <InputField
                type="password"
                value={credentials.password}
                onChange={value => setCredentials(prev => ({ ...prev, password: value }))}
                onKeyDown={handleKeyDown}
                label="Password"
                disabled={isLoading}
              />
            </div>

          {/* Remember me (login only) */}
          {!isSignUp && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: scaled(8),
                fontSize: FONT_SIZES.sm,
                color: COLORS.dark,
                fontFamily: FONTS.primary,
              }}
            >
              <div
                role="checkbox"
                aria-checked={rememberMe}
                tabIndex={0}
                onKeyDown={e => {
                  if (isLoading) return;
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setRememberMe(!rememberMe);
                  }
                }}
                onClick={() => {
                  if (isLoading) return;
                  setRememberMe(!rememberMe);
                }}
                style={{
                  width: scaled(16),
                  height: scaled(16),
                  border: `1px solid ${COLORS.border}`,
                  backgroundColor: COLORS.white,
                  borderRadius: '3px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  outline: 'none',
                }}
              >
                {rememberMe ? (
                  <span
                    aria-hidden="true"
                    style={{
                      color: COLORS.primary,
                      fontSize: '12px',
                      lineHeight: 1,
                      transform: 'translateY(-1px)',
                      userSelect: 'none',
                    }}
                  >
                    ✓
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isLoading) return;
                  setRememberMe(!rememberMe);
                }}
                disabled={isLoading}
                style={{
                  opacity: 0.8,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  color: COLORS.dark,
                  fontFamily: FONTS.primary,
                  fontSize: FONT_SIZES.sm,
                  outline: 'none',
                }}
              >
                Remember me
              </button>
            </div>
          )}

            {/* 에러 메시지 */}
            {error && (
              <div
                style={{
                  width: scaled(512),
                  padding: `${scaled(12)} ${scaled(16)}`,
                  backgroundColor: '#ffebee',
                  borderRadius: '4px',
                  fontSize: FONT_SIZES.sm,
                  color: '#c62828',
                  fontFamily: FONTS.primary,
                }}
              >
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <div style={{ width: scaled(512) }}>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{
                  ...(isLoading ? buttonDisabled : buttonPrimary),
                  width: '100%',
                  height: scaled(48),
                  padding: `${scaled(8)} ${scaled(16)}`,
                  fontSize: FONT_SIZES.md,
                  outline: 'none',
                }}
              >
                {isLoading ? 'loading...' : isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </div>

            {/* 로그인/회원가입 전환 */}
            <div
              style={{
                width: scaled(512),
                fontSize: FONT_SIZES.sm,
                color: COLORS.dark,
                fontFamily: FONTS.primary,
              }}
            >
              <span style={{ opacity: 0.9 }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                onClick={toggleMode}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: COLORS.primary,
                  fontWeight: FONT_WEIGHTS.semibold,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: FONT_SIZES.sm,
                  fontFamily: FONTS.primary,
                  textDecoration: 'underline',
                  outline: 'none',
                }}
              >
                {isSignUp ? 'Login' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <FooterCopyright />
    </div>
  );
};

export default Login;
