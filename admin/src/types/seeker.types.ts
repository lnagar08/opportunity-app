export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
export type CertificateStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DisabilityType {
	id: string;
	name: string;
}

export interface SeekerProfileSummary {
	id: string;
	certificateStatus: CertificateStatus;
	isProfileCompleted: boolean;
	disabilityType: DisabilityType;
}

export interface AdminSeeker {
	id: string;
	fullName: string;
	mobileNumber: string;
	email: string | null;
	city: string | null;
	state: string | null;
	status: AccountStatus;
	isMobileVerified: boolean;
	createdAt: string;
	seekerProfile: SeekerProfileSummary | null;
}

export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	limit: number;
}

export interface ListSeekersParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: AccountStatus;
	certificateStatus?: CertificateStatus;
}