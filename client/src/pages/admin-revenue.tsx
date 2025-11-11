import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminRevenue() {
  const style = { "--sidebar-width": "16rem" };

  const monthlyRevenue = [
    { month: "Jun", amount: 6240, clients: 98 },
    { month: "Jul", amount: 6890, clients: 112 },
    { month: "Aug", amount: 7450, clients: 128 },
    { month: "Sep", amount: 7890, clients: 139 },
    { month: "Oct", amount: 8150, clients: 148 },
    { month: "Nov", amount: 8420, clients: 156 },
  ];

  const packageRevenue = [
    { package: "Basic", price: 29, clients: 62, revenue: 1798 },
    { package: "Premium", price: 59, clients: 54, revenue: 3186 },
    { package: "Elite", price: 99, clients: 40, revenue: 3960 },
  ];

  const recentPayments = [
    { id: 1, client: "John Doe", package: "Elite", amount: 99, date: "Nov 11, 2025", status: "paid" },
    { id: 2, client: "Sarah Smith", package: "Premium", amount: 59, date: "Nov 11, 2025", status: "paid" },
    { id: 3, client: "Mike Johnson", package: "Basic", amount: 29, date: "Nov 10, 2025", status: "paid" },
    { id: 4, client: "Emily Brown", package: "Premium", amount: 59, date: "Nov 10, 2025", status: "pending" },
    { id: 5, client: "David Lee", package: "Elite", amount: 99, date: "Nov 9, 2025", status: "paid" },
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount));
  const totalRevenue = packageRevenue.reduce((sum, p) => sum + p.revenue, 0);

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Revenue & Payments</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Track revenue, payments, and financial analytics</p>
                <Button data-testid="button-export-report">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend="+23% from last month" trendUp={true} />
                <StatCard title="Avg per Client" value={`$${Math.round(totalRevenue / 156)}`} icon={Users} trend="$54/client" trendUp={true} />
                <StatCard title="Payments Due" value="$236" icon={CreditCard} trend="4 pending" trendUp={false} />
                <StatCard title="Growth Rate" value="18%" icon={TrendingUp} trend="+5% this month" trendUp={true} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Monthly Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyRevenue.map((month, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold w-12">{month.month}</span>
                          <div className="flex-1 mx-4">
                            <div className="bg-muted rounded-full h-8 relative overflow-hidden">
                              <div
                                className="bg-primary h-8 rounded-full flex items-center justify-end pr-3"
                                style={{ width: `${(month.amount / maxRevenue) * 100}%` }}
                              >
                                <span className="text-xs font-semibold text-primary-foreground">
                                  ${month.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-muted-foreground text-sm w-24 text-right">
                            {month.clients} clients
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Revenue by Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {packageRevenue.map((pkg) => (
                      <div key={pkg.package} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{pkg.package}</span>
                          <span className="text-sm text-muted-foreground">
                            {pkg.clients} × ${pkg.price} = ${pkg.revenue}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              pkg.package === "Basic" ? "bg-chart-1" :
                              pkg.package === "Premium" ? "bg-chart-2" : "bg-chart-3"
                            }`}
                            style={{ width: `${(pkg.revenue / totalRevenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display">Recent Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentPayments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 rounded-md border"
                          data-testid={`payment-${payment.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{payment.client}</p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{payment.package}</Badge>
                            <span className="font-bold text-lg">${payment.amount}</span>
                            <Badge className={payment.status === "paid" ? "bg-chart-3" : "bg-chart-2"}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
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
