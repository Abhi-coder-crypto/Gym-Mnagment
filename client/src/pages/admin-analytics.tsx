import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Video, Calendar, TrendingUp, Activity } from "lucide-react";

export default function AdminAnalytics() {
  const style = { "--sidebar-width": "16rem" };

  const packageDistribution = [
    { name: "Basic", count: 62, percentage: 40, color: "bg-chart-1" },
    { name: "Premium", count: 54, percentage: 35, color: "bg-chart-2" },
    { name: "Elite", count: 40, percentage: 25, color: "bg-chart-3" },
  ];

  const monthlyGrowth = [
    { month: "Jun", clients: 98 },
    { month: "Jul", clients: 112 },
    { month: "Aug", clients: 128 },
    { month: "Sep", clients: 139 },
    { month: "Oct", clients: 148 },
    { month: "Nov", clients: 156 },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Analytics</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Clients" value={156} icon={Users} trend="+12% from last month" trendUp={true} />
                <StatCard title="Active Users" value={142} icon={Activity} trend="+8% from last month" trendUp={true} />
                <StatCard title="Monthly Revenue" value="$8,420" icon={DollarSign} trend="+23% from last month" trendUp={true} />
                <StatCard title="Total Videos" value={127} icon={Video} trend="+5 this week" trendUp={true} />
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Package Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {packageDistribution.map((pkg) => (
                      <div key={pkg.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="text-muted-foreground">{pkg.count} clients ({pkg.percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`${pkg.color} h-2 rounded-full transition-all`}
                            style={{ width: `${pkg.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Client Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyGrowth.map((data, index) => (
                        <div key={data.month} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-12">{data.month}</span>
                          <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                            <div
                              className="bg-primary h-8 rounded-full flex items-center justify-end pr-3 transition-all"
                              style={{ width: `${(data.clients / 156) * 100}%` }}
                            >
                              <span className="text-xs font-semibold text-primary-foreground">
                                {data.clients}
                              </span>
                            </div>
                          </div>
                          {index > 0 && (
                            <TrendingUp className="h-4 w-4 text-chart-3" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Calendar className="h-5 w-5 text-chart-1 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">New client joined</p>
                        <p className="text-sm text-muted-foreground">John Doe signed up for Elite package</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 pb-3 border-b">
                      <Video className="h-5 w-5 text-chart-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">New video uploaded</p>
                        <p className="text-sm text-muted-foreground">Full Body Strength Training added to library</p>
                        <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-chart-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">Live session completed</p>
                        <p className="text-sm text-muted-foreground">Power Yoga Session with 14 participants</p>
                        <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
