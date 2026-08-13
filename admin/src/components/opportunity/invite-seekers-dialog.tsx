import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CustomSearch from '@/components/custom-controls/custom-search';
import { Mail, Check } from 'lucide-react';
import { opportunityService } from '@/services/opportunity.service';
import { getApiErrorMessage } from '@/lib/http';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { InviteCandidate } from '@/types/opportunity.types';

interface InviteSeekersDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	opportunityId: string;
}

const InviteSeekersDialog = ({ open, onOpenChange, opportunityId }: InviteSeekersDialogProps) => {
	const [search, setSearch] = useState('');
	const [candidates, setCandidates] = useState<InviteCandidate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sendingId, setSendingId] = useState<string | null>(null);
	const debouncedSearch = useDebouncedValue(search, 400);

	const fetchCandidates = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const result = await opportunityService.listInviteCandidates(opportunityId, {
				page: 1,
				limit: 50,
				search: debouncedSearch || undefined
			});
			setCandidates(result.items);
		} catch (err) {
			setError(getApiErrorMessage(err, 'Failed to load candidates'));
		} finally {
			setIsLoading(false);
		}
	}, [opportunityId, debouncedSearch]);

	useEffect(() => {
		if (open) fetchCandidates();
	}, [open, fetchCandidates]);

	const handleSendEmail = async (seeker: InviteCandidate) => {
		setSendingId(seeker.id);
		try {
			await opportunityService.inviteSeeker(opportunityId, seeker.id);
			setCandidates((prev) => prev.map((c) => (c.id === seeker.id ? { ...c, alreadyInvited: true } : c)));
		} catch (err) {
			setError(getApiErrorMessage(err, `Failed to invite ${seeker.fullName}`));
		} finally {
			setSendingId(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Invite Opportunity Seekers</DialogTitle>
				</DialogHeader>

				<CustomSearch value={search} onChange={setSearch} placeholder="Search by name or email" className="w-full" />

				{error && <p className="text-destructive text-sm">{error}</p>}

				<div className="max-h-[400px] space-y-2 overflow-y-auto">
					{isLoading ? (
						<p className="text-muted-foreground text-sm">Loading…</p>
					) : candidates.length === 0 ? (
						<p className="text-muted-foreground text-sm">No eligible seekers found.</p>
					) : (
						candidates.map((seeker) => (
							<div key={seeker.id} className="flex items-center justify-between rounded-md border p-3">
								<div>
									<p className="text-sm font-medium">{seeker.fullName}</p>
									<p className="text-muted-foreground text-xs">
										{seeker.seekerProfile?.disabilityType.name} · {seeker.city ?? '—'}
									</p>
								</div>
								<Button
									size="sm"
									variant={seeker.alreadyInvited ? 'outline' : undefined}
									variantClassName={seeker.alreadyInvited ? undefined : 'primary'}
									disabled={sendingId === seeker.id || seeker.alreadyInvited}
									onClick={() => handleSendEmail(seeker)}
									leftIcon={
										seeker.alreadyInvited ? (
											<Check className="h-3.5 w-3.5" />
										) : (
											<Mail className="h-3.5 w-3.5" />
										)
									}
								>
									{sendingId === seeker.id ? 'Sending…' : seeker.alreadyInvited ? 'Invited' : 'Send Email'}
								</Button>
							</div>
						))
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default InviteSeekersDialog;