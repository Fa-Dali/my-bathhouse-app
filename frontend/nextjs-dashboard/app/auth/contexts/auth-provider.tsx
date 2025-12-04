// app/auth/contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/app/utils/axiosConfig';

export interface IUser {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  pin_code?: string;
  avatar?: string;
  roles: { id: number; code: string; name: string }[];
}

interface IAuthContext {
  authenticated: boolean;
  user: IUser | null;
  loginSuccess: (userData: IUser) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
  authenticated: false,
  user: null,
  loginSuccess: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);

  // 🔁 Восстановление сессии при загрузке
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthenticated(true);

      loadUser();
    } else if (refreshToken) {
      // 🔁 Если access токена нет, но есть refresh — попробуем обновить
      refreshAccessToken(refreshToken);
    }
  }, []);

  // Загружаем профиль
  const loadUser = () => {
    api
      .get('/api/me/')
      .then((res) => {
        setUser(res.data);
        console.log('✅ Восстановлен пользователь:', res.data);
      })
      .catch(async (err) => {
        console.error('❌ Ошибка /api/me/', err);

        const refreshToken = localStorage.getItem('refreshToken');
        if (err.response?.status === 401 && refreshToken) {
          await refreshAccessToken(refreshToken);
        } else {
          // Очищаем всё
          clearAuth();
        }
      });
  };

  // Обновляем access токен через refresh
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await api.post('/api/refresh-token', {
        refresh_token: refreshToken,
      });

      const newToken = response.data.access_token;
      localStorage.setItem('authToken', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Теперь пробуем загрузить пользователя
      loadUser();
    } catch (err) {
      console.error('❌ Не удалось обновить токен', err);
      clearAuth();
    }
  };

  // Очистка сессии
  const clearAuth = () => {
    setAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    delete api.defaults.headers.common['Authorization'];
  };

  const loginSuccess = (userData: IUser) => {
    console.log('🔐 loginSuccess получил:', userData);
    setAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ authenticated, user, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
