import { useCallback, useEffect, useState } from 'react';
import { masterService } from '@/services/master.service';
import { getApiErrorMessage } from '@/lib/http';
import type { MasterItem, MasterResource } from '@/types/master.types';

export function useMasterList(resource: MasterResource) {
	const [items, setItems] = useState<MasterItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchItems = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const data = await masterService.list(resource);
			setItems(data);
		} catch (err) {
			setError(getApiErrorMessage(err, `Failed to load ${resource.replace('-', ' ')}`));
		} finally {
			setIsLoading(false);
		}
	}, [resource]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	return { items, setItems, isLoading, error, refetch: fetchItems };
}