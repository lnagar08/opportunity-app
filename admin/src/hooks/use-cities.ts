import { useCallback, useEffect, useState } from 'react';
import { locationService } from '@/services/location.service';
import { getApiErrorMessage } from '@/lib/http';
import type { AdminCity } from '@/types/location.types';

export function useCities(stateId: string | undefined) {
	const [cities, setCities] = useState<AdminCity[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchCities = useCallback(async () => {
		if (!stateId) {
			setCities([]);
			return;
		}
		setIsLoading(true);
		setError(null);
		try {
			setCities(await locationService.listCities(stateId));
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load cities'));
		} finally {
			setIsLoading(false);
		}
	}, [stateId]);

	useEffect(() => {
		fetchCities();
	}, [fetchCities]);

	return { cities, setCities, isLoading, error, refetch: fetchCities };
}