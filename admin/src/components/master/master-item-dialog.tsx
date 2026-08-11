import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import RequiredAsterisk from '@/components/required-asterisk';
import type { MasterItem } from '@/types/master.types';

const schema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters')
});

type FormValues = z.infer<typeof schema>;

interface MasterItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingItem: MasterItem | null;
	label: string; // "Category" | "Disability Type" — used in dialog title only
	onSubmit: (name: string) => Promise<void>;
}

const MasterItemDialog = ({ open, onOpenChange, editingItem, label, onSubmit }: MasterItemDialogProps) => {
	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { name: '' }
	});

	// Re-seed the form whenever a different item is opened for edit (or the
	// dialog is opened fresh for "Add") — dialogs stay mounted, so props
	// changing alone won't reset an uncontrolled form.
	useEffect(() => {
		if (open) {
			form.reset({ name: editingItem?.name ?? '' });
		}
	}, [open, editingItem, form]);

	const handleSubmit = async (values: FormValues) => {
		await onSubmit(values.name);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{editingItem ? `Edit ${label}` : `Add ${label}`}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="flex flex-col gap-3" onSubmit={form.handleSubmit(handleSubmit)}>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">
										Name <RequiredAsterisk />
									</FormLabel>
									<FormControl>
										<Input placeholder={`e.g. ${label === 'Category' ? 'Data Entry' : 'Visual Impairment'}`} autoFocus {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" variantClassName="primary" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Saving…' : editingItem ? 'Save Changes' : 'Add'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default MasterItemDialog;