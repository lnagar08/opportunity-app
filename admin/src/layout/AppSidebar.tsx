import { LayoutDashboard, Users2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router';
import LogoLight from '@/assets/logo-light-theme.svg';
import LogoDark from '@/assets/logo-dark-theme.svg';
import { useTheme } from '@/context/ThemeContext';
import LogoSidebar from '@/assets/logo-icon.svg';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      isActive: true
    },
    {
      title: 'Seekers Management',
      url: '/seekers',
      icon: Users2,
      isActive: true
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { open, isMobile } = useSidebar();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleItemClick = (url: string | undefined) => {
    if (!url) return;
    setSelectedItem(url);
    navigate(url);
  };

  useEffect(() => {
    const currentPath = location.hash.replace('#', '') || '/';
    setSelectedItem(currentPath);
  }, [location.pathname]);



  const renderLogo = () => {
    if (isMobile || open) {
      return (
        <div className="grid flex-1">
          <img
            src={theme !== 'dark' ? LogoDark : LogoLight}
            alt="Logo"
            className="block h-6 w-[150px]"
          />
        </div>
      );
    }
    return (
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
        <img src={LogoSidebar} alt="Logo Icon" className="block h-[40px] w-[40px] p-1" />
      </div>
    );
  };

  return (
    <Sidebar collapsible="icon" {...props} data-slot="sidebar" data-state="expanded">
      <SidebarHeader className="mb-1 py-3.5">
        <SidebarMenu>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            {renderLogo()}
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {data.navMain.map((item) => {
          //const hasChildren = item?.items && item?.items.length > 0;
          //const isExpanded = expandedMenu === item.title;
          return (
            <div key={item.title}>
              { (
                <SidebarGroup key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => handleItemClick(item.url)}
                    className={`cursor-pointer ${selectedItem === item.url ? 'sidemenu-background !text-white' : !open ? 'sidemenu-icon' : 'sidemenu-icon-expanded'}`}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarGroup>
              )}
            </div>
          );
        })}
      </div>
    </Sidebar>
  );
}
