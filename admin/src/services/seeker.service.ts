import { http, type ApiEnvelope } from '@/lib/http';
import type {
	AdminSeeker,
	ListSeekersParams,
	PaginatedResult,
	AccountStatus,
	CertificateStatus,
	CertificateReviewResult,
	SeekerDetail
} from '@/types/seeker.types';

export const seekerService = {
	list: async (params: ListSeekersParams): Promise<PaginatedResult<AdminSeeker>> => {
		const { data } = await http.get<ApiEnvelope<PaginatedResult<AdminSeeker>>>('/admin/seekers', { params });
		return data.data;
	},

	updateStatus: async (id: string, status: AccountStatus, reason?: string): Promise<AdminSeeker> => {
		const { data } = await http.patch<ApiEnvelope<AdminSeeker>>(`/admin/users/${id}/status`, { status, reason });
		return data.data;
	},

	reviewCertificate: async (
		id: string,
		certificateStatus: Extract<CertificateStatus, 'APPROVED' | 'REJECTED'>,
		rejectReason?: string
	): Promise<CertificateReviewResult> => {
		const { data } = await http.patch<ApiEnvelope<CertificateReviewResult>>(`/admin/seekers/${id}/certificate`, {
			certificateStatus,
			rejectReason
		});
		return data.data;
	},

	getById: async (id: string): Promise<SeekerDetail> => {
		const { data } = await http.get<ApiEnvelope<SeekerDetail>>(`/admin/seekers/${id}`);
		return data.data;
	}
};