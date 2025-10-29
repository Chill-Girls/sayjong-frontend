import type { FunctionComponent } from 'react';
import { useState } from 'react';
import SejongImage from './assets/Sejong.png';
import EyeOffIcon from './assets/eye-off.svg';

interface LoginProps {
  onLogin: () => void;
}

interface LoginCredentials {
  id: string;
  password: string;
} // 데이터베이스 연결 부탁

const Login: FunctionComponent<LoginProps> = ({ onLogin }) => {
  const scale = 0.75;
  const [credentials, setCredentials] = useState<LoginCredentials>({
    id: '',
    password: '',
  });

  const handleLogin = () => {
    console.log('Login credentials:', credentials);
    onLogin();
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
              SIGNUP/LOGIN
            </div>
            <div
              style={{
                position: 'relative',
                fontSize: `${16 * scale}px`,
                opacity: 0.75,
              }}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>Login to learn korean with KPOP songs!</span>
              <span style={{ fontFamily: 'Poppins' }}></span>
            </div>
          </div>
          <div
            style={{
              alignSelf: 'stretch',
              height: `${313 * scale}px`,
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
                        placeholder=""
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
                        placeholder=""
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: `${14 * scale}px`,
                  color: '#313131',
                  fontFamily: 'Pretendard',
                  gap: `${8 * scale}px`,
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    width: `${18 * scale}px`,
                    height: `${18 * scale}px`,
                    cursor: 'pointer',
                  }}
                />
                <label
                  style={{
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Remember me
                </label>
              </div>
            </div>
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
                  onClick={handleLogin}
                  style={{
                    alignSelf: 'stretch',
                    height: `${48 * scale}px`,
                    borderRadius: '4px',
                    backgroundColor: '#f04299',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${8 * scale}px ${16 * scale}px`,
                    boxSizing: 'border-box',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      fontWeight: 600,
                      color: '#f3f3f3',
                    }}
                  >
                    Login
                  </div>
                </button>
              </div>
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
