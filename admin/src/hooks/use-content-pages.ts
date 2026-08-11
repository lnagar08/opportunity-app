import { useCallback, useEffect, useState } from 'react';
import { contentService } from '@/services/content.service';
import { getApiErrorMessage } from '@/lib/http';
import type { ContentPage } from '@/types/content.types';

export function useContentPages() {
	const [pages, setPages] = useState<ContentPage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPages = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await contentService.list();
			setPages(data);
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load content pages'));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchPages();
	}, [fetchPages]);

	return { pages, setPages, isLoading, error, refetch: fetchPages };
}