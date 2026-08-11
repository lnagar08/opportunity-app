import { useCallback, useEffect, useState } from 'react';
import { reportService } from '@/services/report.service';
import { getApiErrorMessage } from '@/lib/http';
import type { AdminReport, ReportStatus, ReportTargetType } from '@/types/report.types';

const PAGE_LIMIT = 10;

export function useReports() {
	const [reportsData, setReportsData] = useState<AdminReport[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [statusFilter, setStatusFilter] = useState<ReportStatus | undefined>('PENDING');
	const [targetTypeFilter, setTargetTypeFilter] = useState<ReportTargetType | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchReports = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await reportService.list({
				page: currentPage,
				limit: PAGE_LIMIT,
				status: statusFilter,
				targetType: targetTypeFilter
			});
			setReportsData(result.items);
			setTotalPages(Math.max(1, Math.ceil(result.total / result.limit)));
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load reports'));
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, statusFilter, targetTypeFilter]);

	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter, targetTypeFilter]);

	useEffect(() => {
		fetchReports();
	}, [fetchReports]);

	return {
		reportsData,
		setReportsData,
		currentPage,
		setCurrentPage,
		totalPages,
		statusFilter,
		setStatusFilter,
		targetTypeFilter,
		setTargetTypeFilter,
		isLoading,
		error,
		refetch: fetchReports
	};
}