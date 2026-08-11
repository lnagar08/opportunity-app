import type { AccountStatus } from '@/types/seeker.types';

export interface GiverProfileSummary {
	organizationName: string | null;
}

export interface AdminGiver {
	id: string;
	fullName: string;
	mobileNumber: string;
	email: string | null;
	city: string | null;
	state: string | null;
	status: AccountStatus;
	isMobileVerified: boolean;
	createdAt: string;
	giverProfile: GiverProfileSummary | null;
	_count: { opportunities: number };
}

export interface ListGiversParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: AccountStatus;
}

export interface GiverOpportunitySummary {
	id: string;
	title: string;
	status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DELETED';
	createdAt: string;
}

export interface GiverDetail {
	id: string;
	fullName: string;
	mobileNumber: string;
	email: string | null;
	city: string | null;
	state: string | null;
	profilePhotoUrl: string | null;
	status: AccountStatus;
	isMobileVerified: boolean;
	createdAt: string;
	giverProfile: GiverProfileSummary | null;
	opportunities: GiverOpportunitySummary[];
}