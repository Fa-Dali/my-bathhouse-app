// app/auth/contexts/auth-provider.tsx
'use client';

import { createContext, useContext, useState } from 'react';

// Интерфейс нашего контекста авторизации
interface IAuthContext {
	authenticated: boolean;
	loginSuccess: () => void;
	logout: () => void;
}

// Создаем контекст авторизации
const AuthContext = createContext<IAuthContext>({
	authenticated: false,
	loginSuccess: () => { },
	logout: () => { },
});

// Основной провайдер авторизации
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [authenticated, setAuthenticated] = useState(false);

	const loginSuccess = () => {
		setAuthenticated(true);
	};

	const logout = () => {
		setAuthenticated(false);
	};

	return (
		<AuthContext.Provider value={{ authenticated, loginSuccess, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

// Hook для удобного использования контекста
export function useAuth() {
	return useContext(AuthContext);
}
