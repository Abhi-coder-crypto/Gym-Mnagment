import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StatCard } from "@/components/stat-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Users, Activity, DollarSign, TrendingUp, UserPlus, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const style = {
    "--sidebar-width": "16rem",
  };

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const packageById = packages.reduce((map, pkg) => {
    map[pkg._id] = pkg;
    return map;
  }, {} as Record<string, any>);

  const clientsWithPackages = clients.map(client => {
    const packageId = typeof client.packageId === 'object' ? client.packageId._id : client.packageId;
    const pkg = packageById[packageId];
    return {
      ...client,
      packageData: pkg || null
    };
  });

  const totalClients = clients.length;
  const activeClients = clientsWithPackages.filter(c => c.packageData).length;
  
  const monthlyRevenue = clientsWithPackages.reduce((sum, client) => {
    return sum + (client.packageData?.price || 0);
  }, 0);

  const recentClients = [...clientsWithPackages]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(client => ({
      name: client.name,
      package: client.packageData?.name || 'No Package',
      joinedDate: new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: client.packageData ? 'active' : 'inactive',
    }));

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b min-h-[56px]">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                Dashboard
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  title="Total Clients"
                  value={totalClients}
                  icon={Users}
                  trend={`${activeClients} active`}
                  trendUp={true}
                />
                <StatCard
                  title="Active Users"
                  value={activeClients}
                  icon={Activity}
                  trend={`${totalClients - activeClients} inactive`}
                  trendUp={true}
                />
                <StatCard
                  title="Monthly Revenue"
                  value={`$${monthlyRevenue.toLocaleString()}`}
                  icon={DollarSign}
                  trend={`From ${totalClients} clients`}
                  trendUp={true}
                />
                <StatCard
                  title="Packages Available"
                  value={packages.length}
                  icon={TrendingUp}
                  trend="Membership plans"
                  trendUp={true}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Recent Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentClients.map((client, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 p-3 rounded-md hover-elevate"
                          data-testid={`row-client-${index}`}
                        >
                          <div className="flex-1">
                            <p className="font-semibold" data-testid="text-client-name">
                              {client.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Joined {client.joinedDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" data-testid="badge-package">
                              {client.package}
                            </Badge>
                            <Badge
                              className={
                                client.status === "active"
                                  ? "bg-chart-3"
                                  : "bg-muted"
                              }
                              data-testid="badge-status"
                            >
                              {client.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setLocation('/admin/clients')}
                      data-testid="button-view-all-clients"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      View All Clients
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" data-testid="button-add-video">
                      <Video className="h-4 w-4 mr-2" />
                      Add New Video
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="button-schedule-session">
                      <Activity className="h-4 w-4 mr-2" />
                      Schedule Live Session
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="button-create-diet">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Create Diet Plan
                    </Button>
                    <Button className="w-full justify-start" variant="outline" data-testid="button-view-analytics">
                      <Users className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
