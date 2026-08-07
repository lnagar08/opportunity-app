import { useCallback, useEffect, useState } from 'react';
import { seekerService } from '@/services/seeker.service';
import { getApiErrorMessage } from '@/lib/http';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { AdminSeeker, AccountStatus, CertificateStatus } from '@/types/seeker.types';

const PAGE_LIMIT = 10;

export function useSeekers(search: string) {
	const [seekersData, setSeekersData] = useState<AdminSeeker[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [statusFilter, setStatusFilter] = useState<AccountStatus | undefined>(undefined);
	const [certificateStatusFilter, setCertificateStatusFilter] = useState<CertificateStatus | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search, 400);

	const fetchSeekers = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await seekerService.list({
				page: currentPage,
				limit: PAGE_LIMIT,
				search: debouncedSearch || undefined,
				status: statusFilter,
				certificateStatus: certificateStatusFilter
			});
			setSeekersData(result.items);
			setTotalPages(Math.max(1, Math.ceil(result.total / result.limit)));
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load seekers'));
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, debouncedSearch, statusFilter, certificateStatusFilter]);

	// Any filter/search change should reset back to page 1, not stay on a
	// page that may no longer exist for the new result set.
	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch, statusFilter, certificateStatusFilter]);

	useEffect(() => {
		fetchSeekers();
	}, [fetchSeekers]);

	return {
		seekersData,
		setSeekersData,
		currentPage,
		setCurrentPage,
		totalPages,
		statusFilter,
		setStatusFilter,
		certificateStatusFilter,
		setCertificateStatusFilter,
		isLoading,
		error,
		refetch: fetchSeekers
	};
}