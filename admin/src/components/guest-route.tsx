import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/AuthContext';

// Wraps public-only routes (login, forgot-password, etc). If a valid
// session already exists, bounce straight to the dashboard instead of
// letting the user see the login form again.
const GuestRoute = () => {
	const { isAuthenticated, isInitializing } = useAuth();

	if (isInitializing) {
		return <div className="min-h-screen flex items-center justify-center bg-background">Loading…</div>;
	}

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Outlet />;
};

export default GuestRoute;