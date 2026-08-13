import { useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/navigation/page-header';
import { Button } from '@/components/ui/button';
import { useAdminOpportunityDetail } from '@/hooks/use-admin-opportunity-detail';
import DetailSection from '@/components/seeker/detail-section';
import { opportunityStatusClassMap } from '@/constants/opportunity-status-constants';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import InviteSeekersDialog from '@/components/opportunity/invite-seekers-dialog';

const OpportunityDetail = () => {
	const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { opportunity, isLoading, error } = useAdminOpportunityDetail(id);

	if (isLoading) {
		return <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">Loading…</div>;
	}

	if (error || !opportunity) {
		return (
			<div className="text-destructive flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm">
				<p>{error ?? 'Opportunity not found'}</p>
				<Button variant="outline" onClick={() => navigate('/opportunities')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
					Back to Opportunities
				</Button>
			</div>
		);
	}

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Opportunity Management', href: '/opportunities' },
					{ label: opportunity.title, href: `/opportunities/${opportunity.id}` }
				]}
				heading={opportunity.title}
			/>

			<div className="mb-4 justify-between flex gap-2 sm:flex-row">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate('/opportunities')}
					leftIcon={<ArrowLeft className="h-4 w-4" />}
				>
					Back to Opportunities
				</Button>
				<Button variantClassName="primary" variant="ghost" onClick={() => setInviteDialogOpen(true)} leftIcon={<Mail className="h-4 w-4" />}>
					Invite Opportunity Seekers
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-1">
					<DetailSection title="Overview">
						<div className="space-y-2 text-sm">
							<Row label="Status" custom={
								<span className={`rounded-md px-2 py-1 text-xs font-medium ${opportunityStatusClassMap[opportunity.status]}`}>
									{opportunity.status}
								</span>
							} />
							<Row label="Work Mode" value={opportunity.workMode} />
							<Row
								label="Budget"
								value={
									opportunity.budgetType === 'FIXED' && opportunity.budgetAmount
										? `₹${opportunity.budgetAmount}`
										: 'Negotiable'
								}
							/>
							{opportunity.city && <Row label="Location" value={`${opportunity.city}, ${opportunity.state ?? ''}`} />}
							{opportunity.opportunityDate && (
								<Row label="Date" value={format(new Date(opportunity.opportunityDate), 'dd MMM yyyy')} />
							)}
							{opportunity.opportunityTime && <Row label="Time" value={opportunity.opportunityTime} />}
							<Row label="Posted On" value={format(new Date(opportunity.createdAt), 'dd MMM yyyy')} />
							<Row label="Applications" value={String(opportunity._count.applications)} />
						</div>
					</DetailSection>

					<DetailSection title="Posted By">
						<div className="space-y-2 text-sm">
							<Row label="Name" value={opportunity.giver.fullName} />
							<Row label="Mobile" value={opportunity.giver.mobileNumber} />
							{opportunity.giver.email && <Row label="Email" value={opportunity.giver.email} />}
						</div>
					</DetailSection>

					{opportunity.categories.length > 0 && (
						<DetailSection title="Categories">
							<div className="flex flex-wrap gap-2">
								{opportunity.categories.map((c) => (
									<span key={c.category.id} className="bg-muted rounded-full px-3 py-1 text-xs font-medium">
										{c.category.name}
									</span>
								))}
							</div>
						</DetailSection>
					)}
				</div>

				<div className="space-y-4 lg:col-span-2">
					<DetailSection title="Description">
						<p className="text-muted-foreground text-sm whitespace-pre-line">{opportunity.description}</p>
					</DetailSection>

					{opportunity.media.length > 0 && (
						<DetailSection title="Attachments">
							<div className="space-y-2">
								{opportunity.media.map((m) => (
									<a
										key={m.id}
										href={m.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary block text-sm font-medium hover:underline"
									>
										{m.fileName ?? m.type} ({m.type})
									</a>
								))}
							</div>
						</DetailSection>
					)}
				</div>
			</div>
			<InviteSeekersDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} opportunityId={opportunity.id} />
		</>
	);
};

const Row = ({ label, value, custom }: { label: string; value?: string; custom?: React.ReactNode }) => (
	<div className="flex items-center justify-between">
		<span className="text-muted-foreground">{label}</span>
		{custom ?? <span className="font-medium">{value}</span>}
	</div>
);

export default OpportunityDetail;