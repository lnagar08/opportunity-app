import { HashRouter as Router, Route, Routes, Navigate } from 'react-router';
import GuestRoute from '@/components/guest-route';
import AppLayout from '@/layout/AppLayout';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/protected-route';
import Dashboard from './pages/Dashboard/Dashboard';
import Seeker from './pages/Seeker/Seeker';
import SeekerDetail from './pages/Seeker/SeekerDetail';
import Login from './pages/Login';
import Giver from './pages/Giver/Giver';
import GiverDetail from './pages/Giver/GiverDetail';
import OpportunityDetail from './pages/Opportunity/OpportunityDetail';
import Opportunity from './pages/Opportunity/Opportunity';
import MasterData from './pages/Master/MasterData';
import Reports from './pages/Reports/Reports';
import ContentManagement from './pages/Content/ContentManagement';
import ForgotPassword from './pages/ForgotPassword';
import RecoverPassword from './pages/RecoverPassword';
import ChangePassword from './pages/ChangePassword';

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					<Route element={<GuestRoute />}>
						<Route path="/" element={<Navigate to="/login" />} />
						<Route path="/login" element={<Login />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/recover-password" element={<RecoverPassword />} />
					</Route>
					
					<Route element={<ProtectedRoute /> }>
						<Route element={<AppLayout />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/seekers" element={<Seeker />} />
							<Route path="/seekers/:id" element={<SeekerDetail />} />
							<Route path="/givers" element={<Giver />} />
							<Route path="/givers/:id" element={<GiverDetail />} />
							<Route path="/opportunities" element={<Opportunity />} />
							<Route path="/opportunities/:id" element={<OpportunityDetail />} />
							<Route path="/master-data" element={<MasterData />} />
							<Route path="/reports" element={<Reports />} />
							<Route path="/content-management" element={<ContentManagement />} />
							<Route path="/change-password" element={<ChangePassword />} />
						</Route>
					</Route>
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
