import { http, type ApiEnvelope } from '@/lib/http';
import type { PaginatedResult, AccountStatus } from '@/types/seeker.types';
import type { AdminGiver, ListGiversParams, GiverDetail } from '@/types/giver.types';

export const giverService = {
	list: async (params: ListGiversParams): Promise<PaginatedResult<AdminGiver>> => {
		const { data } = await http.get<ApiEnvelope<PaginatedResult<AdminGiver>>>('/admin/givers', { params });
		return data.data;
	},

	getById: async (id: string): Promise<GiverDetail> => {
		const { data } = await http.get<ApiEnvelope<GiverDetail>>(`/admin/givers/${id}`);
		return data.data;
	},

	updateStatus: async (id: string, status: AccountStatus, reason?: string): Promise<AdminGiver> => {
		const { data } = await http.patch<ApiEnvelope<AdminGiver>>(`/admin/users/${id}/status`, { status, reason });
		return data.data;
	}
};