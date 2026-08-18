import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon, ChevronDownIcon, LogOutIcon, LockKeyholeOpen } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router';


const AppHeader: React.FC = () => {
	const { admin, logout } = useAuth();
	const { theme, setTheme } = useTheme();
	const navigate = useNavigate();
	
	const dropdownMenuItems = [
		{ label: 'Change Password', icon: LockKeyholeOpen, link: '/change-password' },
		{ label: 'Logout', icon: LogOutIcon, action: logout }
	];
	
	return (
		<header className="bg-background sticky top-0 z-10 flex w-full border-b-0 py-3">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1 cursor-pointer" />
				
			</div>

			<div className="flex items-center gap-2 pr-2 lg:px-6">
				<Button
					variant="ghost"
					variantClassName="light"
					size="icon"
					onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
				>
					{theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							variantClassName="light"
							className="ml-2 flex h-8 min-w-[48px] items-center rounded-full"
						>
							<div className="bg-primary ml-[-11px] flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
								AD
							</div>
							<ChevronDownIcon className="text-muted-foreground h-2 w-2" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="min-w-[180px] px-3 py-2">
						<div className="border-muted mb-2 border-b px-2 pt-1 pb-2">
							<div className="text-foreground text-sm font-semibold">{admin?.fullName}</div>
							<div className="text-muted-foreground text-xs">{admin?.email}</div>
						</div>
						{dropdownMenuItems.map(({ label, icon: Icon, link, action }) => (  
							<DropdownMenuItem 
								key={label} 
								onClick={() => {
								if (link) {
									navigate(link || '')
								} else if (action) {
									action();
								}
								}}
							>  
								<Icon className="mr-2 h-4 w-4" />  
								{label}  
							</DropdownMenuItem>  
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
};
export default AppHeader;
