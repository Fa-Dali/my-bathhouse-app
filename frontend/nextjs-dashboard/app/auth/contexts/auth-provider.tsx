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

  // 🔁 При загрузке проверяем токен и восстанавливаем пользователя
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthenticated(true);

      // Подгружаем данные пользователя
      api
        .get('/api/me/')
        .then((res) => {
          setUser(res.data);
          console.log('✅ Восстановлен пользователь:', res.data);
        })
        .catch((err) => {
          console.error('❌ Не удалось загрузить /api/me/', err);
          setAuthenticated(false);
          setUser(null);
          localStorage.removeItem('authToken');
          delete api.defaults.headers.common['Authorization'];
        });
    }
  }, []);

  const loginSuccess = (userData: IUser) => {
    console.log('🔐 loginSuccess получил:', userData);
    setAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    setAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
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
