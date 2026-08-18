import { http, type ApiEnvelope } from '@/lib/http';
import type { LoginResponse } from '@/types/auth.types';

export interface LoginPayload {
	email: string;
	password: string;
}

export interface ForgotPasswordPayload {
	email: string;
}

export interface ResetPasswordPayload {
	token: string;
	newPassword: string;
	confirmNewPassword: string;
}

export interface ChangePasswordPayload {
	currentPassword: string;
	newPassword: string;
	confirmNewPassword: string;
}

export const authService = {
	login: async (payload: LoginPayload): Promise<LoginResponse> => {
		const { data } = await http.post<ApiEnvelope<LoginResponse>>('/auth/admin/login', payload);
		return data.data;
	},
	forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
		await http.post<ApiEnvelope<null>>('/auth/admin/forgot-password', payload);
	},
	resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
		await http.post<ApiEnvelope<null>>('/auth/admin/reset-password', payload);
	},
	changePassword: async (payload: ChangePasswordPayload): Promise<void> => {
		await http.put<ApiEnvelope<null>>('/auth/admin/change-password', payload);
	}
};