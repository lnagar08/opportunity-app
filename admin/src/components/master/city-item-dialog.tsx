import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import RequiredAsterisk from '@/components/required-asterisk';
import type { AdminCity } from '@/types/location.types';

const schema = z.object({ name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters') });
type FormValues = z.infer<typeof schema>;

interface CityItemDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingCity: AdminCity | null;
	stateName: string;
	onSubmit: (values: FormValues) => Promise<void>;
}

const CityItemDialog = ({ open, onOpenChange, editingCity, stateName, onSubmit }: CityItemDialogProps) => {
	const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '' } });

	useEffect(() => {
		if (open) form.reset({ name: editingCity?.name ?? '' });
	}, [open, editingCity, form]);

	const handleSubmit = async (values: FormValues) => {
		await onSubmit(values);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{editingCity ? 'Edit City' : `Add City to ${stateName}`}</DialogTitle>
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
										<Input placeholder="e.g. Pune" autoFocus {...field} />
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
								{form.formState.isSubmitting ? 'Saving…' : editingCity ? 'Save Changes' : 'Add'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CityItemDialog;