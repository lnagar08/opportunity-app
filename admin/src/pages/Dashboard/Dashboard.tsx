import PageHeader from '@/components/navigation/page-header';
import { Users, Building2, Briefcase, FileText, ShieldCheck, Flag, UserX } from 'lucide-react';
import MetricsCard from '@/components/dashboard/metrics-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

const Dashboard = () => {
	const { stats, isLoading, error } = useDashboardStats();

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Dashboard', href: '/dashboard' }
				]}
				heading="Dashboard"
			/>

			{error && <p className="text-sm text-destructive mb-4">{error}</p>}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricsCard label="Total Seekers" value={stats?.totalSeekers} icon={Users} isLoading={isLoading} />
				<MetricsCard label="Total Givers" value={stats?.totalGivers} icon={Building2} isLoading={isLoading} />
				<MetricsCard
					label="Active Opportunities"
					value={stats?.activeOpportunities}
					icon={Briefcase}
					isLoading={isLoading}
				/>
				<MetricsCard
					label="Total Applications"
					value={stats?.totalApplications}
					icon={FileText}
					isLoading={isLoading}
				/>
				<MetricsCard
					label="Pending Certificates"
					value={stats?.pendingCertificates}
					icon={ShieldCheck}
					isLoading={isLoading}
					tone="warning"
				/>
				<MetricsCard
					label="Pending Reports"
					value={stats?.pendingReports}
					icon={Flag}
					isLoading={isLoading}
					tone="warning"
				/>
				<MetricsCard
					label="Suspended Users"
					value={stats?.suspendedUsers}
					icon={UserX}
					isLoading={isLoading}
					tone="danger"
				/>
			</div>
		</>
	);
};

export default Dashboard;