import { useCallback, useEffect, useState } from 'react';
import { giverService } from '@/services/giver.service';
import { getApiErrorMessage } from '@/lib/http';
import type { GiverDetail } from '@/types/giver.types';

export function useGiverDetail(id: string | undefined) {
	const [giver, setGiver] = useState<GiverDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchGiver = useCallback(async () => {
		if (!id) return;
		setIsLoading(true);
		setError(null);
		try {
			const data = await giverService.getById(id);
			setGiver(data);
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load giver profile'));
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchGiver();
	}, [fetchGiver]);

	return { giver, setGiver, isLoading, error, refetch: fetchGiver };
}