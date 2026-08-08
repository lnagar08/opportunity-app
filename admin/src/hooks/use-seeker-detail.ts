import { useCallback, useEffect, useState } from 'react';
import { seekerService } from '@/services/seeker.service';
import { getApiErrorMessage } from '@/lib/http';
import type { SeekerDetail } from '@/types/seeker.types';

export function useSeekerDetail(id: string | undefined) {
	const [seeker, setSeeker] = useState<SeekerDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchSeeker = useCallback(async () => {
		if (!id) return;
		setIsLoading(true);
		setError(null);
		try {
			const data = await seekerService.getById(id);
			setSeeker(data);
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load seeker profile'));
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		fetchSeeker();
	}, [fetchSeeker]);

	return { seeker, setSeeker, isLoading, error, refetch: fetchSeeker };
}