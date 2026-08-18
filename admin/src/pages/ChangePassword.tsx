import { Card, CardContent } from '@/components/ui/cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import RequiredAsterisk from '@/components/required-asterisk';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { applyServerErrors } from '@/lib/http';

// Mirrors the backend's actual rules (auth.validator.js:
// adminChangePasswordValidator) — min 8, one uppercase, one number.
// Keeping these in sync is what makes client-side validation meaningful;
// otherwise a "valid" password client-side just bounces off the server.
const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current Password is required'),
		newPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters')
			.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
			.regex(/[0-9]/, 'Password must contain at least one number'),
		confirmNewPassword: z.string().min(1, 'Confirm Password is required')
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: 'Passwords do not match',
		path: ['confirmNewPassword']
	});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

const ChangePassword = () => {
	const [serverError, setServerError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string>('');

	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmNewPassword: ''
		}
	});

	async function onSubmit(data: ChangePasswordFormValues) {
		setServerError(null);
		setSuccessMessage('');
		try {
			await authService.changePassword(data);
			setSuccessMessage('Password changed successfully.');
			form.reset(); // clears all fields, including the password values
		} catch (error) {
			applyServerErrors(error, form, setServerError);
		}
	}

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-background">
			<Card className="w-full max-w-md mx-auto shadow-lg">
				<CardContent className="flex flex-col gap-4 py-6">
					{serverError && <p className="text-sm text-destructive">{serverError}</p>}
					{successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
					<Form {...form}>
						<form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
							<FormField
								control={form.control}
								name="currentPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">
											Current Password <RequiredAsterisk />
										</FormLabel>
										<FormControl>
											<Input id="currentPassword" type="password" placeholder="Current Password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="newPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">
											New Password <RequiredAsterisk />
										</FormLabel>
										<FormControl>
											<Input id="newPassword" type="password" placeholder="New Password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="confirmNewPassword"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">
											Confirm Password <RequiredAsterisk />
										</FormLabel>
										<FormControl>
											<Input id="confirmNewPassword" type="password" placeholder="Confirm Password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" variantClassName="primary" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? 'Changing…' : 'Change password'}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
};

export default ChangePassword;