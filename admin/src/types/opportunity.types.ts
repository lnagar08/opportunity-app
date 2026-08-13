export type OpportunityStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DELETED';
export type BudgetType = 'FIXED' | 'NEGOTIABLE';
export type WorkMode = 'REMOTE' | 'ONSITE' | 'HYBRID';

export interface OpportunityGiverSummary {
	id: string;
	fullName: string;
	mobileNumber: string;
	email?: string;
}

export interface OpportunityCategoryItem {
	category: { id: string; name: string };
}

export interface OpportunityMediaItem {
	id: string;
	type: 'IMAGE' | 'AUDIO' | 'VIDEO' | 'PDF';
	url: string;
	fileName: string | null;
}

export interface AdminOpportunity {
	id: string;
	title: string;
	description: string;
	budgetType: BudgetType;
	budgetAmount: string | null;
	workMode: WorkMode;
	city: string | null;
	state: string | null;
	opportunityDate: string | null;
	opportunityTime: string | null;
	status: OpportunityStatus;
	createdAt: string;
	giver: OpportunityGiverSummary;
	_count: { applications: number };
}

export interface AdminOpportunityDetail extends AdminOpportunity {
	categories: OpportunityCategoryItem[];
	media: OpportunityMediaItem[];
}

export interface ListOpportunitiesParams {
	page?: number;
	limit?: number;
	status?: OpportunityStatus;
	search?: string;
}

export interface InviteCandidate {
	id: string;
	fullName: string;
	email: string | null;
	city: string | null;
	state: string | null;
	profilePhotoUrl: string | null;
	seekerProfile: { bio: string | null; disabilityType: { name: string } } | null;
	alreadyInvited: boolean;
}