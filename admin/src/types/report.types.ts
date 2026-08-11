export type ReportTargetType = 'USER' | 'OPPORTUNITY' | 'MESSAGE';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';

export interface ReportUserSummary {
	id: string;
	fullName: string;
	role: 'SEEKER' | 'GIVER' | 'ADMIN';
	mobileNumber?: string;
}

export interface AdminReport {
	id: string;
	targetType: ReportTargetType;
	targetId: string;
	reason: string;
	status: ReportStatus;
	adminNote: string | null;
	createdAt: string;
	reportedBy: ReportUserSummary;
	reportedUser: ReportUserSummary | null;
}

export interface ListReportsParams {
	page?: number;
	limit?: number;
	status?: ReportStatus;
	targetType?: ReportTargetType;
}

export interface UpdateReportPayload {
	status: Exclude<ReportStatus, 'PENDING'>;
	adminNote?: string;
}

export interface ReportedUserTarget {
	id: string;
	fullName: string;
	role: 'SEEKER' | 'GIVER' | 'ADMIN';
	status: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
}

export interface ReportedOpportunityTarget {
	id: string;
	title: string;
	description: string;
	status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DELETED';
	giverId: string;
}

export interface ReportedMessageTarget {
	id: string;
	text: string | null;
	senderId: string;
	conversationId: string;
	createdAt: string;
}

export type ReportTarget = ReportedUserTarget | ReportedOpportunityTarget | ReportedMessageTarget | null;

export interface AdminReport {
	id: string;
	targetType: ReportTargetType;
	targetId: string;
	target: ReportTarget; // resolved content — was missing before, only a bare targetId
	reason: string;
	status: ReportStatus;
	adminNote: string | null;
	createdAt: string;
	reportedBy: ReportUserSummary;
	reportedUser: ReportUserSummary | null;
}

export interface UpdateReportPayload {
	status: Exclude<ReportStatus, 'PENDING'>;
	adminNote?: string;
	suspendReportedUser?: boolean;
}