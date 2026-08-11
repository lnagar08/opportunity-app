import { useCallback, useEffect, useState } from 'react';
import { opportunityService } from '@/services/opportunity.service';
import { getApiErrorMessage } from '@/lib/http';
import type { AdminOpportunityDetail } from '@/types/opportunity.types';

export function useAdminOpportunityDetail(id: string | undefined) {
	const [opportunity, setOpportunity] = useState<AdminOpportunityDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchOpportunity = useCallback(async () => {
		if (!id) return;
		setIsLoading(true);
		setError(null);
		try {
			const data = await opportunityService.getById(id);
			setOpportunity(data);
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load opportunity'));
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchOpportunity();
	}, [fetchOpportunity]);

	return { opportunity, setOpportunity, isLoading, error, refetch: fetchOpportunity };
}