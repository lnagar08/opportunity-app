import { HashRouter as Router, Route, Routes, Navigate } from 'react-router';
import GuestRoute from '@/components/guest-route';
import AppLayout from '@/layout/AppLayout';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/protected-route';
import Dashboard from './pages/Dashboard/Dashboard';
import Seeker from './pages/Seeker/Seeker';
import Login from './pages/Login';

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					<Route element={<GuestRoute />}>
						<Route path="/" element={<Navigate to="/login" />} />
						<Route path="/login" element={<Login />} />
					</Route>
					
					<Route element={<ProtectedRoute /> }>
						<Route element={<AppLayout />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/seekers" element={<Seeker />} />
							{/* other authenticated routes */}
						</Route>
					</Route>
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
