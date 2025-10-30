import type { FunctionComponent } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { login, signup } from './api/auth';
import SejongImage from './assets/Sejong.png';
import EyeOffIcon from './assets/eye-off.svg';

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
  const scale = 0.75;
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
      // 회원가입 성공 후 로그인 모드로 전환
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

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        backgroundColor: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${66 * scale}px ${108 * scale}px`,
        boxSizing: 'border-box',
        gap: `${141 * scale}px`,
        textAlign: 'left',
        fontSize: '40px',
        color: '#313131',
        fontFamily: 'Pretendard',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: `${18 * scale}px`,
          minWidth: `${1100 * scale}px`,
          maxWidth: `${1200 * scale}px`,
          zIndex: 0,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: `${-80 * scale}px`,
            left: 0,
            fontSize: `${64 * scale}px`,
            letterSpacing: '-0.01em',
            lineHeight: '150%',
            fontWeight: 800,
            color: '#f04299',
          }}
        >
          <span>Say</span>
          <span style={{ color: '#313131' }}>Jong</span>
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: `${70 * scale}px`,
          }}
        >
          <div
            style={{
              alignSelf: 'stretch',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: `${16 * scale}px`,
            }}
          >
            <div
              style={{
                position: 'relative',
                fontWeight: 600,
                fontSize: `${40 * scale}px`,
              }}
            >
              {isSignUp ? 'SIGN UP' : 'LOGIN'}
            </div>
            <div
              style={{
                position: 'relative',
                fontSize: `${16 * scale}px`,
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
          <div
            style={{
              alignSelf: 'stretch',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: `${40 * scale}px`,
              fontSize: `${16 * scale}px`,
              color: '#1c1b1f',
              fontFamily: 'Poppins',
            }}
          >
            <div
              style={{
                alignSelf: 'stretch',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: `${24 * scale}px`,
              }}
            >
              {/* ID Input */}
              <div
                style={{
                  width: `${512 * scale}px`,
                  borderRadius: '4px 4px 0px 0px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    border: '1px solid #79747e',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'stretch',
                      borderRadius: '4px 4px 0px 0px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: `${8 * scale}px 0px ${8 * scale}px ${16 * scale}px`,
                    }}
                  >
                    <div
                      style={{
                        height: `${40 * scale}px`,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <input
                        type="text"
                        value={credentials.id}
                        onChange={e => setCredentials({ ...credentials, id: e.target.value })}
                        onKeyPress={handleKeyPress}
                        placeholder=""
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          fontSize: `${16 * scale}px`,
                          fontFamily: 'Poppins',
                          padding: 0,
                          position: 'relative',
                          zIndex: 2,
                          color: '#1c1b1f',
                        }}
                      />
                      <div
                        style={{
                          margin: '0 !important',
                          position: 'absolute',
                          top: `${-16 * scale}px`,
                          left: `${-4 * scale}px`,
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          padding: `0px ${4 * scale}px`,
                          zIndex: 1,
                          fontSize: `${14 * scale}px`,
                          fontFamily: 'Pretendard',
                          pointerEvents: 'none',
                        }}
                      >
                        <div style={{ position: 'relative' }}>ID</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div
                style={{
                  width: `${512 * scale}px`,
                  height: `${56 * scale}px`,
                  borderRadius: '4px 4px 0px 0px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    alignSelf: 'stretch',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    border: '1px solid #79747e',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'stretch',
                      borderRadius: '4px 4px 0px 0px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: `${4 * scale}px 0px ${4 * scale}px ${16 * scale}px`,
                    }}
                  >
                    <div
                      style={{
                        height: `${40 * scale}px`,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <input
                        type="password"
                        value={credentials.password}
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        onKeyPress={handleKeyPress}
                        placeholder=""
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          border: 'none',
                          outline: 'none',
                          backgroundColor: 'transparent',
                          fontSize: `${16 * scale}px`,
                          fontFamily: 'Poppins',
                          padding: 0,
                          position: 'relative',
                          zIndex: 2,
                          color: '#1c1b1f',
                        }}
                      />
                      <div
                        style={{
                          margin: '0 !important',
                          position: 'absolute',
                          top: `${-16 * scale}px`,
                          left: `${-4 * scale}px`,
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          padding: `0px ${4 * scale}px`,
                          zIndex: 1,
                          fontSize: `${14 * scale}px`,
                          color: '#313131',
                          fontFamily: 'Pretendard',
                          pointerEvents: 'none',
                        }}
                      >
                        <div style={{ position: 'relative' }}>Password</div>
                      </div>
                    </div>
                    <div
                      style={{
                        height: `${48 * scale}px`,
                        width: `${48 * scale}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: `${12 * scale}px`,
                        boxSizing: 'border-box',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={EyeOffIcon}
                        alt="Toggle password visibility"
                        style={{
                          width: `${24 * scale}px`,
                          height: `${24 * scale}px`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Nickname Input - Only for Sign Up */}
              {isSignUp && (
                <div
                  style={{
                    width: `${512 * scale}px`,
                    borderRadius: '4px 4px 0px 0px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      alignSelf: 'stretch',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      border: '1px solid #79747e',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        alignSelf: 'stretch',
                        borderRadius: '4px 4px 0px 0px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: `${8 * scale}px 0px ${8 * scale}px ${16 * scale}px`,
                      }}
                    >
                      <div
                        style={{
                          height: `${40 * scale}px`,
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'center',
                          position: 'relative',
                        }}
                      >
                        <input
                          type="text"
                          value={credentials.nickname}
                          onChange={e =>
                            setCredentials({ ...credentials, nickname: e.target.value })
                          }
                          onKeyPress={handleKeyPress}
                          placeholder=""
                          disabled={isLoading}
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            fontSize: `${16 * scale}px`,
                            fontFamily: 'Poppins',
                            padding: 0,
                            position: 'relative',
                            zIndex: 2,
                            color: '#1c1b1f',
                          }}
                        />
                        <div
                          style={{
                            margin: '0 !important',
                            position: 'absolute',
                            top: `${-16 * scale}px`,
                            left: `${-4 * scale}px`,
                            backgroundColor: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            padding: `0px ${4 * scale}px`,
                            zIndex: 1,
                            fontSize: `${14 * scale}px`,
                            fontFamily: 'Pretendard',
                            pointerEvents: 'none',
                          }}
                        >
                          <div style={{ position: 'relative' }}>Nickname</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  width: `${512 * scale}px`,
                  padding: `${12 * scale}px ${16 * scale}px`,
                  backgroundColor: '#ffebee',
                  borderRadius: '4px',
                  fontSize: `${14 * scale}px`,
                  color: '#c62828',
                  fontFamily: 'Pretendard',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div
              style={{
                borderRadius: `${30 * scale}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                fontSize: `${20 * scale}px`,
                color: '#f3f3f3',
                fontFamily: 'Pretendard',
              }}
            >
              <div
                style={{
                  width: `${512 * scale}px`,
                  borderRadius: `${30 * scale}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  style={{
                    alignSelf: 'stretch',
                    height: `${48 * scale}px`,
                    borderRadius: '4px',
                    backgroundColor: isLoading ? '#ccc' : '#f04299',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${8 * scale}px ${16 * scale}px`,
                    boxSizing: 'border-box',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      fontWeight: 600,
                      color: '#f3f3f3',
                    }}
                  >
                    {isLoading ? 'loading...' : isSignUp ? 'Sign Up' : 'Login'}
                  </div>
                </button>
              </div>
            </div>

            {/* Toggle between Login/SignUp */}
            <div
              style={{
                width: `${512 * scale}px`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: `${14 * scale}px`,
                color: '#313131',
                fontFamily: 'Pretendard',
              }}
            >
              <span style={{ opacity: 0.75 }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                onClick={toggleMode}
                disabled={isLoading}
                style={{
                  marginLeft: `${8 * scale}px`,
                  background: 'none',
                  border: 'none',
                  color: '#f04299',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: `${14 * scale}px`,
                  fontFamily: 'Pretendard',
                  textDecoration: 'underline',
                }}
              >
                {isSignUp ? 'Login' : 'Sign up'}
              </button>
            </div>

            <div
              style={{
                alignSelf: 'stretch',
                display: 'flex',
                alignItems: 'center',
                gap: `${16 * scale}px`,
              }}
            >
              <div
                style={{
                  height: `${0.5 * scale}px`,
                  flex: 1,
                  position: 'relative',
                  backgroundColor: '#313131',
                  opacity: 0.25,
                }}
              />
              <div
                style={{
                  height: `${0.5 * scale}px`,
                  flex: 1,
                  position: 'relative',
                  backgroundColor: '#313131',
                  opacity: 0.25,
                }}
              />
            </div>
          </div>
        </div>
        <div
          style={{
            flex: 0.9662,
            display: 'flex',
            alignItems: 'flex-start',
            padding: `${10 * scale}px`,
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
