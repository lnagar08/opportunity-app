import { useTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon } from 'lucide-react';
import logoDarkTheme from '@/assets/logo-dark-theme.svg';
import logoLightTheme from '@/assets/logo-light-theme.svg';
import { Card, CardContent } from '@/components/ui/cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useNavigate, Link } from 'react-router';
import RequiredAsterisk from '@/components/required-asterisk';
import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { getApiErrorMessage } from '@/lib/http';
import { CheckCircle2 } from 'lucide-react';
const forgotSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email')
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
	const { theme, setTheme } = useTheme();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

	const navigate = useNavigate();
	const form = useForm<ForgotFormValues>({
		resolver: zodResolver(forgotSchema),
		defaultValues: {
			email: ''
		}
	});

	async function onSubmit(data: ForgotFormValues) {
		setServerError(null);
		try {
			await authService.forgotPassword({ email: data.email });
			setIsSubmitted(true);
		} catch (error) {
			// Now a real 404 will surface here instead of always succeeding
			setServerError(getApiErrorMessage(error, 'Something went wrong. Please try again.'));
		}
	}

	return (
		<div className="min-h-screen flex flex-col justify-center items-center bg-background">
			<div className="absolute top-4 right-4">
				<Button
					variant="ghost"
					variantClassName="light"
					size="icon"
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				>
					{theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
				</Button>
			</div>
			<Card className="w-full max-w-md mx-auto shadow-lg">
				<CardContent className="flex flex-col gap-4 py-6">
					<div className="flex flex-col items-center gap-2">
						<img
							src={theme === 'dark' ? logoLightTheme : logoDarkTheme}
							alt="Logo"
							className="mb-2 w-32 md:w-32 transition-all duration-200"
						/>
						{!isSubmitted && (
							<p className="text-muted-foreground text-sm">
								You forgot your password? Here you can easily retrieve a new password.
							</p>
						)}
					</div>

					{isSubmitted ? (
						<div className="flex flex-col items-center gap-3 text-center">
							<CheckCircle2 className="h-10 w-10 text-emerald-500" />
							<p className="text-sm text-muted-foreground">
								If <strong>{form.getValues('email')}</strong> is registered, we've sent a password reset link to
								it. Check your inbox (and spam folder) — the link expires in 30 minutes.
							</p>
						</div>
					) : (
						<Form {...form}>
							<form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium">
												Email <RequiredAsterisk />
											</FormLabel>
											<FormControl>
												<Input id="email" type="email" placeholder="Email" autoFocus {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{serverError && <p className="text-sm text-destructive">{serverError}</p>}
								<Button
									type="submit"
									className="w-full"
									variantClassName="primary"
									disabled={form.formState.isSubmitting}
								>
									{form.formState.isSubmitting ? 'Sending…' : 'Request new password'}
								</Button>
							</form>
						</Form>
					)}

					<div className="flex flex-col gap-1 text-sm text-center mt-2">
						<Link to="/login" className="text-blue-600">
							Remember your password? Login
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default ForgotPassword;
