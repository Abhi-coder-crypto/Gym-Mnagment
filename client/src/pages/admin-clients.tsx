import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Mail, Phone, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminClients() {
  const style = { "--sidebar-width": "16rem" };

  const clients = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234-567-8901", package: "Elite", status: "active", joinDate: "Nov 10, 2025", lastActive: "2 hours ago" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", phone: "+1 234-567-8902", package: "Premium", status: "active", joinDate: "Nov 9, 2025", lastActive: "5 hours ago" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1 234-567-8903", package: "Basic", status: "active", joinDate: "Nov 8, 2025", lastActive: "1 day ago" },
    { id: 4, name: "Emily Brown", email: "emily@example.com", phone: "+1 234-567-8904", package: "Premium", status: "inactive", joinDate: "Nov 7, 2025", lastActive: "5 days ago" },
    { id: 5, name: "David Lee", email: "david@example.com", phone: "+1 234-567-8905", package: "Elite", status: "active", joinDate: "Nov 6, 2025", lastActive: "3 hours ago" },
    { id: 6, name: "Lisa Wang", email: "lisa@example.com", phone: "+1 234-567-8906", package: "Basic", status: "active", joinDate: "Nov 5, 2025", lastActive: "6 hours ago" },
    { id: 7, name: "James Wilson", email: "james@example.com", phone: "+1 234-567-8907", package: "Premium", status: "active", joinDate: "Nov 4, 2025", lastActive: "1 hour ago" },
    { id: 8, name: "Maria Garcia", email: "maria@example.com", phone: "+1 234-567-8908", package: "Elite", status: "inactive", joinDate: "Nov 3, 2025", lastActive: "7 days ago" },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Clients</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-10"
                    data-testid="input-search-clients"
                  />
                </div>
                <Button data-testid="button-add-client">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">All Clients ({clients.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="flex items-center gap-4 p-4 rounded-md border hover-elevate"
                        data-testid={`row-client-${client.id}`}
                      >
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold" data-testid="text-client-name">{client.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right hidden md:block">
                            <p className="text-sm font-medium">Joined</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {client.joinDate}
                            </p>
                          </div>
                          <Badge variant="outline" data-testid="badge-package">
                            {client.package}
                          </Badge>
                          <Badge
                            className={client.status === "active" ? "bg-chart-3" : "bg-muted"}
                            data-testid="badge-status"
                          >
                            {client.status}
                          </Badge>
                          <Button variant="outline" size="sm" data-testid="button-view-details">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
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
