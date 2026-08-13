import { http, type ApiEnvelope } from '@/lib/http';
import type { PaginatedResult } from '@/types/seeker.types';
import type { AdminOpportunity, AdminOpportunityDetail, ListOpportunitiesParams } from '@/types/opportunity.types';
import type { InviteCandidate } from '@/types/opportunity.types';

export const opportunityService = {
	list: async (params: ListOpportunitiesParams): Promise<PaginatedResult<AdminOpportunity>> => {
		const { data } = await http.get<ApiEnvelope<PaginatedResult<AdminOpportunity>>>('/admin/opportunities', {
			params
		});
		return data.data;
	},

	getById: async (id: string): Promise<AdminOpportunityDetail> => {
		const { data } = await http.get<ApiEnvelope<AdminOpportunityDetail>>(`/admin/opportunities/${id}`);
		return data.data;
	},

	close: async (id: string): Promise<AdminOpportunity> => {
		const { data } = await http.patch<ApiEnvelope<AdminOpportunity>>(`/admin/opportunities/${id}/close`);
		return data.data;
	},

	remove: async (id: string): Promise<void> => {
		await http.delete<ApiEnvelope<null>>(`/admin/opportunities/${id}`);
	},

	listInviteCandidates: async (
		opportunityId: string,
		params: { page?: number; limit?: number; search?: string }
	): Promise<PaginatedResult<InviteCandidate>> => {
		const { data } = await http.get<ApiEnvelope<PaginatedResult<InviteCandidate>>>(
			`/admin/opportunities/${opportunityId}/invite-candidates`,
			{ params }
		);
		return data.data;
	},

	inviteSeeker: async (opportunityId: string, seekerId: string): Promise<void> => {
		await http.post<ApiEnvelope<null>>(`/admin/opportunities/${opportunityId}/invite`, { seekerId });
	}
};