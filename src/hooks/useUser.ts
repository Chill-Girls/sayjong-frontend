import { useState, useEffect } from 'react';
import { getMe } from '../api/user';
import type { UserInfo } from '../api/user/types';

export function useUser() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setUserInfo(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getMe();
        setUserInfo(data);
        setError(null);
      } catch (e) {
        console.error('Failed to fetch user info:', e);
        setUserInfo(null);
        setError((e as Error).message || '사용자 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return { userInfo, loading, error };
}
