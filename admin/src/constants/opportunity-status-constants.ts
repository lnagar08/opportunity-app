export const opportunityStatusClassMap: Record<string, string> = {
	DRAFT: 'bg-slate-500/10 text-slate-600',
	ACTIVE: 'bg-emerald-500/10 text-emerald-600',
	CLOSED: 'bg-amber-500/10 text-amber-600',
	DELETED: 'bg-red-500/10 text-red-600'
};

export const opportunityStatusOptions = [
	{ value: 'DRAFT', label: 'Draft' },
	{ value: 'ACTIVE', label: 'Active' },
	{ value: 'CLOSED', label: 'Closed' },
	{ value: 'DELETED', label: 'Deleted' }
];