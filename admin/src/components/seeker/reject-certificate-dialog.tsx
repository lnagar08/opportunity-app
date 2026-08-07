import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface RejectCertificateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (reason: string) => Promise<void>;
}

const RejectCertificateDialog = ({ open, onOpenChange, onConfirm }: RejectCertificateDialogProps) => {
	const [reason, setReason] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConfirm = async () => {
		if (!reason.trim()) {
			setError('Reason is required to reject a certificate');
			return;
		}
		setIsSubmitting(true);
		setError(null);
		try {
			await onConfirm(reason.trim());
			setReason('');
			onOpenChange(false);
		} catch {
			setError('Failed to reject certificate. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reject Disability Certificate</DialogTitle>
				</DialogHeader>
				<div className="space-y-2">
					<Textarea
						placeholder="Explain why this certificate is being rejected…"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						rows={4}
					/>
					{error && <p className="text-sm text-destructive">{error}</p>}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
						{isSubmitting ? 'Rejecting…' : 'Reject Certificate'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default RejectCertificateDialog;