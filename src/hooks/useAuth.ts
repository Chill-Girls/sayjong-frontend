import { useState } from 'react';
import { login, signup } from '../api/auth';
import type { LoginRequest, SignupRequest } from '../api/auth/types';

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  // TODO: BE와 cookie로 작업
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: LoginRequest) => {
    if (!credentials.loginId || !credentials.userPassword) {
      const errorMsg = 'Please enter your ID and password.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenInfo = await login(credentials);
      setTokens(tokenInfo.accessToken, tokenInfo.refreshToken);
      return { success: true, tokenInfo };
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Login failed.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (credentials: SignupRequest) => {
    if (!credentials.loginId || !credentials.userPassword || !credentials.nickname) {
      const errorMsg = 'Please fill in all fields.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      await signup(credentials);
      return { success: true };
    } catch (err) {
      console.error('Signup error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Sign up failed.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    handleSignUp,
    isLoading,
    error,
  };
}
