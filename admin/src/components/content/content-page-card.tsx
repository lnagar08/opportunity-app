import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/cards';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import RequiredAsterisk from '@/components/required-asterisk';
import { contentService } from '@/services/content.service';
import { getApiErrorMessage } from '@/lib/http';
import type { ContentPage } from '@/types/content.types';
import RichTextEditor from './rich-text-editor';
import { Controller } from 'react-hook-form';

const schema = z.object({
	title: z.string().min(1, 'Title is required').max(150, 'Title must be under 150 characters'),
	content: z.string().min(1, 'Content is required')
});

type FormValues = z.infer<typeof schema>;

interface ContentPageCardProps {
	page: ContentPage;
	onUpdated: (updated: ContentPage) => void;
}

const ContentPageCard = ({ page, onUpdated }: ContentPageCardProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { title: page.title, content: page.content }
	});

	const startEditing = () => {
		form.reset({ title: page.title, content: page.content });
		setServerError(null);
		setIsEditing(true);
	};

	const handleSubmit = async (values: FormValues) => {
		setServerError(null);
		try {
			const updated = await contentService.update(page.slug, values);
			onUpdated(updated);
			setIsEditing(false);
		} catch (err) {
			setServerError(getApiErrorMessage(err, 'Failed to save changes'));
		}
	};

	return (
		<Card className="shadow-sm">
			<CardContent className="py-5">
				<div className="mb-4 flex items-start justify-between">
					<div>
						<h3 className="text-sm font-semibold">{page.title}</h3>
						<p className="text-muted-foreground mt-1 text-xs">
							{page.updatedByAdmin
								? `Last updated by ${page.updatedByAdmin.fullName} on ${format(new Date(page.updatedAt), 'dd MMM yyyy, h:mm a')}`
								: 'Not yet edited — showing placeholder content'}
						</p>
					</div>
					{!isEditing && (
						<Button variant="outline" size="sm" onClick={startEditing} leftIcon={<Pencil className="h-3.5 w-3.5" />}>
							Edit
						</Button>
					)}
				</div>

				{isEditing ? (
					<Form {...form}>
						<form className="flex flex-col gap-3" onSubmit={form.handleSubmit(handleSubmit)}>
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">
											Title <RequiredAsterisk />
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium">
                                            Content <RequiredAsterisk />
                                        </FormLabel>
                                        <FormControl>
                                            <RichTextEditor value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
							{serverError && <p className="text-destructive text-sm">{serverError}</p>}
							<div className="flex justify-end gap-2 pt-1">
								<Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={form.formState.isSubmitting}>
									Cancel
								</Button>
								<Button type="submit" variantClassName="primary" disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? 'Saving…' : 'Save Changes'}
								</Button>
							</div>
						</form>
					</Form>
				) : (
					<div
						className="prose prose-sm text-muted-foreground max-w-none"
						dangerouslySetInnerHTML={{ __html: page.content || '<p><em>No content yet.</em></p>' }}
					/>
				)}
			</CardContent>
		</Card>
	);
};

export default ContentPageCard;