import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from '@/lib/token';
import type { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export const http = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
	timeout: 15000
});

http.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// AuthProvider registers itself here so the interceptor can trigger a clean
// logout + redirect without importing React/router into this module.
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: () => void) => {
	onUnauthorized = handler;
};

http.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			clearToken();
			onUnauthorized?.();
		}
		return Promise.reject(error);
	}
);

export interface ApiEnvelope<T> {
	success: boolean;
	message: string;
	data: T;
}

export interface ApiErrorEnvelope {
	success: false;
	message: string;
	errors?: { field: string; message: string }[];
}

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
	if (axios.isAxiosError<ApiErrorEnvelope>(error)) {
		return error.response?.data?.message ?? fallback;
	}
	return fallback;
};

export function applyServerErrors<T extends FieldValues>(
	error: unknown,
	form: UseFormReturn<T>,
	setGeneralError: (message: string) => void
): void {
	if (axios.isAxiosError<ApiErrorEnvelope>(error) && error.response?.data?.errors?.length) {
		let matchedAny = false;
		for (const { field, message } of error.response.data.errors) {
			if (field in form.getValues()) {
				form.setError(field as Path<T>, { type: 'server', message });
				matchedAny = true;
			}
		}
		if (matchedAny) return;
	}
	setGeneralError(getApiErrorMessage(error));
}