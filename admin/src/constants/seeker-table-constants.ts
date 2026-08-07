import type { AccountStatus, CertificateStatus } from '@/types/seeker.types';

export const accountStatusOptions: { value: AccountStatus; label: string; color: string }[] = [
	{ value: 'ACTIVE', label: 'Active', color: 'text-emerald-500' },
	{ value: 'SUSPENDED', label: 'Suspended', color: 'text-amber-500' },
	{ value: 'DEACTIVATED', label: 'Deactivated', color: 'text-red-500' }
];

export const accountStatusClassMap: Record<AccountStatus, string> = {
	ACTIVE: 'bg-emerald-500/10 text-emerald-500 [&>svg]:!text-emerald-500',
	SUSPENDED: 'bg-amber-500/10 text-amber-500 [&>svg]:!text-amber-500',
	DEACTIVATED: 'bg-red-500/10 text-red-500 [&>svg]:!text-red-500'
};

export const certificateStatusClassMap: Record<CertificateStatus, string> = {
	PENDING: 'bg-amber-500/10 text-amber-600',
	APPROVED: 'bg-emerald-500/10 text-emerald-600',
	REJECTED: 'bg-red-500/10 text-red-600'
};