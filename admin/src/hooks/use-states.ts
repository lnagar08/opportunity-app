import { useCallback, useEffect, useState } from 'react';
import { locationService } from '@/services/location.service';
import { getApiErrorMessage } from '@/lib/http';
import type { AdminState } from '@/types/location.types';

export function useStates() {
	const [states, setStates] = useState<AdminState[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStates = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			setStates(await locationService.listStates());
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load states'));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStates();
	}, [fetchStates]);

	return { states, setStates, isLoading, error, refetch: fetchStates };
}