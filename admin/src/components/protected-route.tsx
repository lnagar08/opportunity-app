import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
	requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ requireSuperAdmin = false }: ProtectedRouteProps) => {
	const { isAuthenticated, isInitializing, admin } = useAuth();
	const location = useLocation();

	if (isInitializing) {
		return <div className="min-h-screen flex items-center justify-center bg-background">Loading…</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	// Route-level authorization — e.g. wrap /admin-management routes with this
	if (requireSuperAdmin && !admin?.isSuperAdmin) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;