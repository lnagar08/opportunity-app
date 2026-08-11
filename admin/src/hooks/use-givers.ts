import { useCallback, useEffect, useState } from 'react';
import { giverService } from '@/services/giver.service';
import { getApiErrorMessage } from '@/lib/http';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { AccountStatus } from '@/types/seeker.types';
import type { AdminGiver } from '@/types/giver.types';

const PAGE_LIMIT = 10;

export function useGivers(search: string) {
	const [giversData, setGiversData] = useState<AdminGiver[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [statusFilter, setStatusFilter] = useState<AccountStatus | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search, 400);

	const fetchGivers = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await giverService.list({
				page: currentPage,
				limit: PAGE_LIMIT,
				search: debouncedSearch || undefined,
				status: statusFilter
			});
			setGiversData(result.items);
			setTotalPages(Math.max(1, Math.ceil(result.total / result.limit)));
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load givers'));
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, debouncedSearch, statusFilter]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch, statusFilter]);

	useEffect(() => {
		fetchGivers();
	}, [fetchGivers]);

	return {
		giversData,
		setGiversData,
		currentPage,
		setCurrentPage,
		totalPages,
		statusFilter,
		setStatusFilter,
		isLoading,
		error,
		refetch: fetchGivers
	};
}