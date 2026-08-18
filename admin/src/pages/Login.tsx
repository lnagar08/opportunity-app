import { Card, CardContent } from '@/components/ui/cards';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon } from 'lucide-react';
import logoDarkTheme from '@/assets/logo-dark-theme.svg';
import logoLightTheme from '@/assets/logo-light-theme.svg';
import { useNavigate, Link } from 'react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import RequiredAsterisk from '@/components/required-asterisk';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/http';

const loginSchema = z.object({
	email: z.string().min(1, 'Email is required').email('Invalid email'),
	password: z.string().min(1, 'Password is required'),
	remember: z.boolean().optional()
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
    const { login } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	async function onSubmit(data: LoginFormValues) {
        setServerError(null);
        try {
            await login({ email: data.email, password: data.password });
            navigate('/dashboard', { replace: true });
        } catch (error) {
            setServerError(getApiErrorMessage(error, 'Invalid email or password'));
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
						<p className="text-muted-foreground text-sm">Sign in to start your session</p>
					</div>

                    {serverError && <p className="text-sm text-destructive text-center">{serverError}</p>}

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
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">
											Password <RequiredAsterisk />
										</FormLabel>
										<FormControl>
											<Input id="password" type="password" placeholder="Password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							
                            <Button type="submit" className="w-full" variantClassName="primary" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Signing in…' : 'Sign In'}
                            </Button>
						</form>
					</Form>
					<div className="flex flex-col gap-1 text-sm text-center mt-2">
						<Link to="/forgot-password" className="text-blue-600">
							I forgot my password
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Login;
