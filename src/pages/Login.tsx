import type { FunctionComponent } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../api/auth';
import SejongImage from '../assets/Sejong.png';
import EyeOffIcon from '../assets/eye-off.svg';
import { COLORS, FONTS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import {
  containerCentered,
  flexColumn,
  flexCenter,
  inputField,
  inputContainer,
  inputLabel,
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

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken); //TODO: BE와 cookie로 작업
}

const Login: FunctionComponent<LoginProps> = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    id: '',
    password: '',
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!credentials.id || !credentials.password) {
      setError('Please enter your ID and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenInfo = await login({
        loginId: credentials.id,
        userPassword: credentials.password,
      });
      setTokens(tokenInfo.accessToken, tokenInfo.refreshToken);
      toast.success('Login successful! Welcome back!');
      navigate('/calibration');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed.');
      toast.error(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!credentials.id || !credentials.password || !credentials.nickname) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signup({
        loginId: credentials.id,
        userPassword: credentials.password,
        nickname: credentials.nickname,
      });
      toast.success('Sign up successful! Please log in now.');
      setIsSignUp(false);
      setCredentials({ id: '', password: '', nickname: '' });
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Sign up failed.');
      toast.error(err instanceof Error ? err.message : 'Sign up failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isSignUp) {
      handleSignUp();
    } else {
      handleLogin();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setCredentials({ id: '', password: '', nickname: '' });
  };

  // 재사용 가능한 입력 필드 컴포넌트
  const InputField = ({
    type,
    value,
    onChange,
    label,
  }: {
    type: string;
    value: string;
    onChange: (value: string) => void;
    label: string;
  }) => (
    <div
      style={{
        width: scaled(512),
        ...flexColumn,
      }}
    >
      <div style={inputContainer}>
        <div
          style={{
            ...flexCenter,
            alignSelf: 'stretch',
            padding: `${scaled(type === 'password' ? 4 : 8)} 0 ${scaled(type === 'password' ? 4 : 8)} ${scaled(16)}`,
          }}
        >
          <div
            style={{
              height: scaled(40),
              flex: 1,
              ...flexColumn,
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <input
              type={type}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder=""
              disabled={isLoading}
              style={{
                ...inputField,
                fontSize: FONT_SIZES.base,
                position: 'relative',
                zIndex: 2,
              }}
            />
            <div
              style={{
                ...inputLabel,
                top: scaled(-16),
                left: scaled(-4),
                padding: `0 ${scaled(4)}`,
                fontSize: FONT_SIZES.sm,
              }}
            >
              <div style={{ position: 'relative' }}>{label}</div>
            </div>
          </div>
          {type === 'password' && (
            <div
              style={{
                ...flexCenter,
                height: scaled(48),
                width: scaled(48),
                padding: scaled(12),
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <img
                src={EyeOffIcon}
                alt="Toggle password visibility"
                style={{
                  width: scaled(24),
                  height: scaled(24),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
          gap: scaled(18),
          minWidth: scaled(1100),
          maxWidth: scaled(1200),
          zIndex: 0,
          position: 'relative',
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
          <span>Say</span>
          <span style={{ color: COLORS.dark }}>Jong</span>
        </div>

        {/* 폼 영역 */}
        <div
          style={{
            flex: 1,
            ...flexColumn,
            alignItems: 'flex-start',
            gap: scaled(70),
          }}
        >
          {/* 타이틀 */}
          <div
            style={{
              alignSelf: 'stretch',
              ...flexColumn,
              alignItems: 'flex-start',
              gap: scaled(16),
            }}
          >
            <div
              style={{
                position: 'relative',
                fontWeight: FONT_WEIGHTS.semibold,
                fontSize: FONT_SIZES.xxl,
              }}
            >
              {isSignUp ? 'SIGN UP' : 'LOGIN'}
            </div>
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
              gap: scaled(40),
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
                gap: scaled(24),
              }}
            >
              <InputField
                type="text"
                value={credentials.id}
                onChange={value => setCredentials({ ...credentials, id: value })}
                label="ID"
              />

              <InputField
                type="password"
                value={credentials.password}
                onChange={value => setCredentials({ ...credentials, password: value })}
                label="Password"
              />

              {isSignUp && (
                <InputField
                  type="text"
                  value={credentials.nickname || ''}
                  onChange={value => setCredentials({ ...credentials, nickname: value })}
                  label="Nickname"
                />
              )}
            </div>

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
                }}
              >
                {isLoading ? 'loading...' : isSignUp ? 'Sign Up' : 'Login'}
              </button>
            </div>

            {/* 로그인/회원가입 전환 */}
            <div
              style={{
                width: scaled(512),
                ...flexCenter,
                fontSize: FONT_SIZES.sm,
                color: COLORS.dark,
                fontFamily: FONTS.primary,
              }}
            >
              <span style={{ opacity: 0.75 }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                onClick={toggleMode}
                disabled={isLoading}
                style={{
                  marginLeft: scaled(8),
                  background: 'none',
                  border: 'none',
                  color: COLORS.primary,
                  fontWeight: FONT_WEIGHTS.semibold,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: FONT_SIZES.sm,
                  fontFamily: FONTS.primary,
                  textDecoration: 'underline',
                }}
              >
                {isSignUp ? 'Login' : 'Sign up'}
              </button>
            </div>

            {/* 구분선 */}
            <div
              style={{
                alignSelf: 'stretch',
                ...flexCenter,
                gap: scaled(16),
              }}
            >
              <div
                style={{
                  height: scaled(0.5),
                  flex: 1,
                  backgroundColor: COLORS.dark,
                  opacity: 0.25,
                }}
              />
              <div
                style={{
                  height: scaled(0.5),
                  flex: 1,
                  backgroundColor: COLORS.dark,
                  opacity: 0.25,
                }}
              />
            </div>
          </div>
        </div>

        {/* 세종대왕 이미지 */}
        <div
          style={{
            flex: 0.9662,
            display: 'flex',
            alignItems: 'flex-start',
            padding: scaled(10),
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
      </div>
    </div>
  );
};

export default Login;
