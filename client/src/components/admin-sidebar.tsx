import {
  LayoutDashboard,
  Users,
  UserPlus,
  Video,
  UtensilsCrossed,
  Calendar,
  BarChart3,
  DollarSign,
  Home,
  FileText,
  Settings,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/admin/dashboard" },
  { title: "Clients", icon: Users, url: "/admin/clients" },
  { title: "Client Setup", icon: UserPlus, url: "/admin/client-setup" },
  { title: "Trainers", icon: Users, url: "/admin/trainers" },
  { title: "Videos", icon: Video, url: "/admin/videos" },
  { title: "Diet Plans", icon: UtensilsCrossed, url: "/admin/diet" },
  { title: "Live Sessions", icon: Calendar, url: "/admin/sessions" },
  { title: "Analytics", icon: TrendingUp, url: "/admin/analytics" },
  { title: "Reports", icon: FileText, url: "/admin/reports" },
  { title: "Revenue", icon: DollarSign, url: "/admin/revenue" },
  { title: "Settings", icon: Settings, url: "/admin/settings" },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-display text-lg">
            FitPro Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="link-home">
                  <Link href="/admin">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
