import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { authService, type LoginPayload } from '@/services/auth.service';
import { setUnauthorizedHandler } from '@/lib/http';
import { getToken, setToken, clearToken, getStoredAdmin, setStoredAdmin, getTokenExpiryMs } from '@/lib/token';
import type { Admin } from '@/types/auth.types';

interface AuthContextValue {
	admin: Admin | null;
	isAuthenticated: boolean;
	isInitializing: boolean;
	login: (payload: LoginPayload) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const navigate = useNavigate();
	const [admin, setAdmin] = useState<Admin | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	const logout = () => {
		clearToken();
		setAdmin(null);
		navigate('/login', { replace: true });
	};

	// Hydrate on app boot: trust a stored token only if it hasn't expired yet.
	// Register the 401 handler so any API call anywhere can force a logout.
	useEffect(() => {
		setUnauthorizedHandler(logout);

		const token = getToken();
		const storedAdmin = getStoredAdmin<Admin>();
		if (token && storedAdmin) {
			const expiryMs = getTokenExpiryMs(token);
			if (expiryMs && expiryMs > Date.now()) {
				setAdmin(storedAdmin);
			} else {
				clearToken();
			}
		}
		setIsInitializing(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const login = async (payload: LoginPayload) => {
		const { token, admin: loggedInAdmin } = await authService.login(payload);
		setToken(token);
		setStoredAdmin(loggedInAdmin);
		setAdmin(loggedInAdmin);
	};

	const value = useMemo<AuthContextValue>(
		() => ({ admin, isAuthenticated: !!admin, isInitializing, login, logout }),
		[admin, isInitializing]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
	return ctx;
}