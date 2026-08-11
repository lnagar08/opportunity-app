import { http, type ApiEnvelope } from '@/lib/http';
import type { PaginatedResult } from '@/types/seeker.types';
import type { AdminReport, ListReportsParams, UpdateReportPayload } from '@/types/report.types';

export const reportService = {
	list: async (params: ListReportsParams): Promise<PaginatedResult<AdminReport>> => {
		const { data } = await http.get<ApiEnvelope<PaginatedResult<AdminReport>>>('/admin/reports', { params });
		return data.data;
	},

	getById: async (id: string): Promise<AdminReport> => {
		const { data } = await http.get<ApiEnvelope<AdminReport>>(`/admin/reports/${id}`);
		return data.data;
	},

	updateStatus: async (id: string, payload: UpdateReportPayload): Promise<AdminReport> => {
		const { data } = await http.patch<ApiEnvelope<AdminReport>>(`/admin/reports/${id}`, payload);
		return data.data;
	}
};