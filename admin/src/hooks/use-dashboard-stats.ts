import { useEffect, useState, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { getApiErrorMessage } from '@/lib/http';
import type { AdminDashboardStats } from '@/types/dashboard.types';

interface UseDashboardStatsResult {
	stats: AdminDashboardStats | null;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useDashboardStats(): UseDashboardStatsResult {
	const [stats, setStats] = useState<AdminDashboardStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await dashboardService.getStats();
			setStats(data);
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load dashboard stats'));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return { stats, isLoading, error, refetch: fetchStats };
}