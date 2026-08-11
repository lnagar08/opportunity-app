import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmActionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	destructive?: boolean;
	onConfirm: () => Promise<void>;
}

// Generic confirm-before-destructive-action dialog — used for Close and
// Delete on the Opportunity Management screen, but not tied to either.
const ConfirmActionDialog = ({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	destructive,
	onConfirm
}: ConfirmActionDialogProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleConfirm = async () => {
		setIsSubmitting(true);
		setError(null);
		try {
			await onConfirm();
			onOpenChange(false);
		} catch {
			setError('Action failed. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button
						variant={destructive ? 'destructive' : 'default'}
						onClick={handleConfirm}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Please wait…' : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmActionDialog;