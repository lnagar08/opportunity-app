const TOKEN_KEY = 'admin_access_token';
const ADMIN_KEY = 'admin_profile';

export const getToken = (): string | null => {
	try {
		return localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
};

export const setToken = (token: string): void => {
	localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(ADMIN_KEY);
};

export const getStoredAdmin = <T>(): T | null => {
	const raw = localStorage.getItem(ADMIN_KEY);
	return raw ? (JSON.parse(raw) as T) : null;
};

export const setStoredAdmin = (admin: unknown): void => {
	localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
};

// Decodes the JWT payload locally (no extra dependency) just to read `exp`,
// so we can skip a network call on app boot if the token is already dead.
export const getTokenExpiryMs = (token: string): number | null => {
	try {
		const payload = token.split('.')[1];
		const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
		return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
	} catch {
		return null;
	}
};