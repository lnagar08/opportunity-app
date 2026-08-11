import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import CustomSelect from '@/components/custom-controls/custom-select';
import { resolveStatusOptions, targetTypeLabel, reportStatusClassMap } from '@/constants/report-constants';
import type { AdminReport, UpdateReportPayload } from '@/types/report.types';

interface ResolveReportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	report: AdminReport | null;
	onConfirm: (payload: UpdateReportPayload) => Promise<void>;
}

const ResolveReportDialog = ({ open, onOpenChange, report, onConfirm }: ResolveReportDialogProps) => {
	const [status, setStatus] = useState<UpdateReportPayload['status']>('REVIEWED');
	const [adminNote, setAdminNote] = useState('');
	const [suspendReportedUser, setSuspendReportedUser] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open && report) {
			setStatus(report.status === 'PENDING' ? 'REVIEWED' : (report.status as UpdateReportPayload['status']));
			setAdminNote(report.adminNote ?? '');
			setSuspendReportedUser(false);
			setError(null);
		}
	}, [open, report]);

	if (!report) return null;

	const handleConfirm = async () => {
		setIsSubmitting(true);
		setError(null);
		try {
			await onConfirm({
				status,
				adminNote: adminNote.trim() || undefined,
				suspendReportedUser: suspendReportedUser || undefined
			});
			onOpenChange(false);
		} catch {
			setError('Failed to update report. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderTarget = () => {
		if (!report.target) {
			return <p className="text-muted-foreground text-sm italic">Original content is no longer available.</p>;
		}
		if (report.targetType === 'USER' && 'fullName' in report.target) {
			return (
				<p className="text-sm">
					{report.target.fullName} <span className="text-muted-foreground">({report.target.role}, {report.target.status})</span>
				</p>
			);
		}
		if (report.targetType === 'OPPORTUNITY' && 'title' in report.target) {
			return (
				<div>
					<p className="text-sm font-medium">{report.target.title}</p>
					<p className="text-muted-foreground mt-1 line-clamp-3 text-xs">{report.target.description}</p>
				</div>
			);
		}
		if (report.targetType === 'MESSAGE' && 'text' in report.target) {
			return <p className="text-sm italic">"{report.target.text ?? '(attachment only)'}"</p>;
		}
		return null;
	};

	// Already-inactive users don't need the suspend checkbox offered again.
	const canSuspend =
		report.reportedUser &&
		!(report.targetType === 'USER' && report.target && 'status' in report.target && report.target.status !== 'ACTIVE');

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>Report Details</DialogTitle>
				</DialogHeader>

				<div className="space-y-3 text-sm">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Reported by</span>
						<span className="font-medium">
							{report.reportedBy.fullName} ({report.reportedBy.role})
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Target Type</span>
						<span className="font-medium">{targetTypeLabel[report.targetType]}</span>
					</div>

					<div>
						<p className="text-muted-foreground mb-1">Reported Content</p>
						<div className="bg-muted rounded-md p-3">{renderTarget()}</div>
					</div>

					{report.reportedUser && (
						<div className="flex items-center justify-between">
							<span className="text-muted-foreground">Associated User</span>
							<span className="font-medium">
								{report.reportedUser.fullName} ({report.reportedUser.role})
							</span>
						</div>
					)}

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Current Status</span>
						<span className={`rounded-md px-2 py-1 text-xs font-medium ${reportStatusClassMap[report.status]}`}>
							{report.status}
						</span>
					</div>

					<div>
						<p className="text-muted-foreground mb-1">Reason</p>
						<p className="bg-muted rounded-md p-3 whitespace-pre-line">{report.reason}</p>
					</div>

					<div className="pt-2">
						<p className="mb-1.5 font-medium">Resolve as</p>
						<CustomSelect
							value={status}
							onValueChange={(value) => setStatus(value as UpdateReportPayload['status'])}
							options={resolveStatusOptions}
							placeholder="Select resolution"
							className="w-full"
						/>
					</div>

					<div>
						<p className="mb-1.5 font-medium">Admin Note (optional)</p>
						<Textarea
							value={adminNote}
							onChange={(e) => setAdminNote(e.target.value)}
							placeholder="Internal note about how this was resolved…"
							rows={3}
						/>
					</div>

					{canSuspend && (
						<label className="flex items-center gap-2 pt-1">
							<Checkbox checked={suspendReportedUser} onCheckedChange={(v) => setSuspendReportedUser(v === true)} />
							<span>
								Also suspend <strong>{report.reportedUser?.fullName}</strong>'s account
							</span>
						</label>
					)}

					{error && <p className="text-destructive text-sm">{error}</p>}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						variant={suspendReportedUser ? 'destructive' : 'default'}
						onClick={handleConfirm}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Saving…' : suspendReportedUser ? 'Save & Suspend' : 'Save'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ResolveReportDialog;