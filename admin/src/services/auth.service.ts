import { http, type ApiEnvelope } from '@/lib/http';
import type { LoginResponse } from '@/types/auth.types';

export interface LoginPayload {
	email: string;
	password: string;
}

export const authService = {
	login: async (payload: LoginPayload): Promise<LoginResponse> => {
		const { data } = await http.post<ApiEnvelope<LoginResponse>>('/auth/admin/login', payload);
		return data.data;
	}
};