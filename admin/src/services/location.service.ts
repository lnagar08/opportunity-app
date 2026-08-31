import { http, type ApiEnvelope } from '@/lib/http';
import type { AdminState, AdminCity } from '@/types/location.types';

export const locationService = {
	listStates: async (): Promise<AdminState[]> => {
		const { data } = await http.get<ApiEnvelope<AdminState[]>>('/admin/master/states');
		return data.data;
	},
	createState: async (payload: { name: string; code?: string }): Promise<AdminState> => {
		const { data } = await http.post<ApiEnvelope<AdminState>>('/admin/master/states', payload);
		return data.data;
	},
	updateState: async (id: string, payload: { name?: string; code?: string; isActive?: boolean }): Promise<AdminState> => {
		const { data } = await http.put<ApiEnvelope<AdminState>>(`/admin/master/states/${id}`, payload);
		return data.data;
	},
	deactivateState: async (id: string): Promise<void> => {
		await http.delete<ApiEnvelope<null>>(`/admin/master/states/${id}`);
	},

	listCities: async (stateId?: string): Promise<AdminCity[]> => {
		const { data } = await http.get<ApiEnvelope<AdminCity[]>>('/admin/master/cities', { params: { stateId } });
		return data.data;
	},
	createCity: async (payload: { name: string; stateId: string }): Promise<AdminCity> => {
		const { data } = await http.post<ApiEnvelope<AdminCity>>('/admin/master/cities', payload);
		return data.data;
	},
	updateCity: async (id: string, payload: { name?: string; stateId?: string; isActive?: boolean }): Promise<AdminCity> => {
		const { data } = await http.put<ApiEnvelope<AdminCity>>(`/admin/master/cities/${id}`, payload);
		return data.data;
	},
	deactivateCity: async (id: string): Promise<void> => {
		await http.delete<ApiEnvelope<null>>(`/admin/master/cities/${id}`);
	}
};