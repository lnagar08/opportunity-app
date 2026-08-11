import { useParams, useNavigate } from 'react-router';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/navigation/page-header';
import { Button } from '@/components/ui/button';
import { useGiverDetail } from '@/hooks/use-giver-detail';
import DetailSection from '@/components/seeker/detail-section';
import { accountStatusClassMap } from '@/constants/seeker-table-constants';
import { opportunityStatusClassMap } from '@/constants/opportunity-status-constants';

const GiverDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { giver, isLoading, error } = useGiverDetail(id);

	if (isLoading) {
		return <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">Loading…</div>;
	}

	if (error || !giver) {
		return (
			<div className="text-destructive flex min-h-[40vh] flex-col items-center justify-center gap-3 text-sm">
				<p>{error ?? 'Giver not found'}</p>
				<Button variant="outline" onClick={() => navigate('/givers')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
					Back to Givers
				</Button>
			</div>
		);
	}

	return (
		<>
			<PageHeader
				items={[
					{ label: 'Home', href: '/dashboard' },
					{ label: 'Givers Management', href: '/givers' },
					{ label: giver.fullName, href: `/givers/${giver.id}` }
				]}
				heading={giver.fullName}
			/>

			<div className="mb-4">
				<Button variant="ghost" size="sm" onClick={() => navigate('/givers')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
					Back to Givers
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="space-y-4 lg:col-span-1">
					<DetailSection title="Account">
						<div className="space-y-2 text-sm">
							<Row label="Organization" value={giver.giverProfile?.organizationName ?? '—'} />
							<Row label="Mobile Number" value={giver.mobileNumber} />
							<Row label="Email" value={giver.email ?? '—'} />
							<Row label="City" value={giver.city ?? '—'} />
							<Row label="State" value={giver.state ?? '—'} />
							<Row label="Mobile Verified" value={giver.isMobileVerified ? 'Yes' : 'No'} />
							<Row label="Joined" value={format(new Date(giver.createdAt), 'dd MMM yyyy')} />
							<div className="flex items-center justify-between pt-1">
								<span className="text-muted-foreground">Account Status</span>
								<span className={`rounded-md px-2 py-1 text-xs font-medium ${accountStatusClassMap[giver.status]}`}>
									{giver.status}
								</span>
							</div>
						</div>
					</DetailSection>
				</div>

				<div className="space-y-4 lg:col-span-2">
					<DetailSection title={`Opportunities Posted (${giver.opportunities.length})`}>
						{giver.opportunities.length ? (
							<div className="space-y-3">
								{giver.opportunities.map((opp) => (
									<div key={opp.id} className="border-muted flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
										<div>
											<p className="text-sm font-medium">{opp.title}</p>
											<p className="text-muted-foreground text-xs">{format(new Date(opp.createdAt), 'dd MMM yyyy')}</p>
										</div>
										<span className={`rounded-md px-2 py-1 text-xs font-medium ${opportunityStatusClassMap[opp.status]}`}>
											{opp.status}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">No opportunities posted yet.</p>
						)}
					</DetailSection>
				</div>
			</div>
		</>
	);
};

const Row = ({ label, value }: { label: string; value: string }) => (
	<div className="flex items-center justify-between">
		<span className="text-muted-foreground">{label}</span>
		<span className="font-medium">{value}</span>
	</div>
);

export default GiverDetail;