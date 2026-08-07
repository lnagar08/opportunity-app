import { http, type ApiEnvelope } from '@/lib/http';
import type { AdminDashboardStats } from '@/types/dashboard.types';

export const dashboardService = {
	getStats: async (): Promise<AdminDashboardStats> => {
		const { data } = await http.get<ApiEnvelope<AdminDashboardStats>>('/admin/dashboard');
		return data.data;
	}
};