import { useCallback, useEffect, useState } from 'react';
import { opportunityService } from '@/services/opportunity.service';
import { getApiErrorMessage } from '@/lib/http';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { AdminOpportunity, OpportunityStatus } from '@/types/opportunity.types';

const PAGE_LIMIT = 10;

export function useAdminOpportunities(search: string) {
	const [opportunitiesData, setOpportunitiesData] = useState<AdminOpportunity[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [statusFilter, setStatusFilter] = useState<OpportunityStatus | undefined>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const debouncedSearch = useDebouncedValue(search, 400);

	const fetchOpportunities = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await opportunityService.list({
				page: currentPage,
				limit: PAGE_LIMIT,
				search: debouncedSearch || undefined,
				status: statusFilter
			});
			setOpportunitiesData(result.items);
			setTotalPages(Math.max(1, Math.ceil(result.total / result.limit)));
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load opportunities'));
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, debouncedSearch, statusFilter]);

	useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearch, statusFilter]);

	useEffect(() => {
		fetchOpportunities();
	}, [fetchOpportunities]);

	return {
		opportunitiesData,
		setOpportunitiesData,
		currentPage,
		setCurrentPage,
		totalPages,
		statusFilter,
		setStatusFilter,
		isLoading,
		error,
		refetch: fetchOpportunities
	};
}