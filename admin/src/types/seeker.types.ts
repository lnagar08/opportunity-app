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

export interface CertificateReviewResult {
	id: string; // seekerProfile.id — NOT the seeker's user id
	userId: string;
	certificateStatus: CertificateStatus;
	certificateRejectReason: string | null;
}

export interface Education {
	id: string;
	institution: string;
	degree: string;
	fieldOfStudy: string | null;
	startYear: number;
	endYear: number | null;
	currentlyStudying: boolean;
}

export interface Experience {
	id: string;
	organization: string;
	position: string;
	description: string | null;
	startDate: string;
	endDate: string | null;
	currentlyWorking: boolean;
	fresher: boolean;
}

export interface SeekerSkill {
	id: string;
	skillName: string;
}

export interface Award {
	id: string;
	awardName: string;
	organization: string | null;
	year: number;
}

export interface Certification {
	id: string;
	certificationName: string;
	issuedBy: string | null;
	date: string;
}

export interface PortfolioItem {
	id: string;
	title: string;
	description: string | null;
}

export interface ApplicationSummary {
	id: string;
	status: 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
	appliedAt: string;
}

export interface SeekerProfileDetail {
	id: string;
	dateOfBirth: string;
	gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
	disabilityType: DisabilityType;
	disabilityCertificateUrl: string;
	certificateStatus: CertificateStatus;
	certificateRejectReason: string | null;
	bio: string | null;
	availableForRemote: boolean;
	willingToTravel: boolean;
	isProfileCompleted: boolean;
	education: Education[];
	experience: Experience[];
	skills: SeekerSkill[];
	awards: Award[];
	certifications: Certification[];
	portfolioItems: PortfolioItem[];
}

export interface SeekerDetail {
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
	seekerProfile: SeekerProfileDetail | null;
	applications: ApplicationSummary[];
}