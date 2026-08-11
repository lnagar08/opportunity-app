import { http, type ApiEnvelope } from '@/lib/http';
import type { MasterItem, MasterResource } from '@/types/master.types';

export const masterService = {
	list: async (resource: MasterResource): Promise<MasterItem[]> => {
		const { data } = await http.get<ApiEnvelope<MasterItem[]>>(`/admin/master/${resource}`);
		return data.data;
	},

	create: async (resource: MasterResource, name: string): Promise<MasterItem> => {
		const { data } = await http.post<ApiEnvelope<MasterItem>>(`/admin/master/${resource}`, { name });
		return data.data;
	},

	update: async (resource: MasterResource, id: string, payload: { name?: string; isActive?: boolean }): Promise<MasterItem> => {
		const { data } = await http.put<ApiEnvelope<MasterItem>>(`/admin/master/${resource}/${id}`, payload);
		return data.data;
	},

	// Backend soft-deactivates (isActive: false) rather than deleting the row,
	// since Seekers/Opportunities may already reference it.
	deactivate: async (resource: MasterResource, id: string): Promise<void> => {
		await http.delete<ApiEnvelope<null>>(`/admin/master/${resource}/${id}`);
	}
};