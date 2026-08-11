import type { ReportStatus, ReportTargetType } from '@/types/report.types';

export const reportStatusClassMap: Record<ReportStatus, string> = {
	PENDING: 'bg-amber-500/10 text-amber-600',
	REVIEWED: 'bg-blue-500/10 text-blue-600',
	DISMISSED: 'bg-slate-500/10 text-slate-600',
	ACTION_TAKEN: 'bg-emerald-500/10 text-emerald-600'
};

export const reportStatusFilterOptions: { value: ReportStatus; label: string }[] = [
	{ value: 'PENDING', label: 'Pending' },
	{ value: 'REVIEWED', label: 'Reviewed' },
	{ value: 'DISMISSED', label: 'Dismissed' },
	{ value: 'ACTION_TAKEN', label: 'Action Taken' }
];

// Excludes PENDING — an admin resolves *into* one of these, never back to Pending.
export const resolveStatusOptions: { value: 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN'; label: string }[] = [
	{ value: 'REVIEWED', label: 'Mark as Reviewed' },
	{ value: 'DISMISSED', label: 'Dismiss' },
	{ value: 'ACTION_TAKEN', label: 'Action Taken' }
];

export const targetTypeFilterOptions: { value: ReportTargetType; label: string }[] = [
	{ value: 'USER', label: 'User' },
	{ value: 'OPPORTUNITY', label: 'Opportunity' },
	{ value: 'MESSAGE', label: 'Message' }
];

export const targetTypeLabel: Record<ReportTargetType, string> = {
	USER: 'User',
	OPPORTUNITY: 'Opportunity',
	MESSAGE: 'Message'
};