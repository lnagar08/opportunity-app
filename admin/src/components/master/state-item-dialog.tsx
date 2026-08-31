import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import RequiredAsterisk from '@/components/required-asterisk';
import type { AdminState } from '@/types/location.types';

const schema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
	code: z.string().max(10, 'Code must be under 10 characters').optional()
});

type FormValues = z.infer<typeof schema>;

interface StateItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingState: AdminState | null;
	onSubmit: (values: FormValues) => Promise<void>;
}

const StateItemDialog = ({ open, onOpenChange, editingState, onSubmit }: StateItemDialogProps) => {
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', code: '' } });

	useEffect(() => {
		if (open) form.reset({ name: editingState?.name ?? '', code: editingState?.code ?? '' });
	}, [open, editingState, form]);

	const handleSubmit = async (values: FormValues) => {
		await onSubmit(values);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{editingState ? 'Edit State' : 'Add State'}</DialogTitle>
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
										<Input placeholder="e.g. Maharashtra" autoFocus {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="code"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">Code (optional)</FormLabel>
									<FormControl>
										<Input placeholder="e.g. MH" {...field} />
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
								{form.formState.isSubmitting ? 'Saving…' : editingState ? 'Save Changes' : 'Add'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default StateItemDialog;