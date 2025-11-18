import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  TrendingUp,
  Package
} from "lucide-react";

export default function TrainerClients() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [trainerId, setTrainerId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('trainerId');
    if (!id) {
      setLocation('/trainer/dashboard');
    } else {
      setTrainerId(id);
    }
  }, [setLocation]);

  const { data: trainer } = useQuery<any>({
    queryKey: ['/api/trainers', trainerId],
    enabled: !!trainerId,
  });

  const { data: allClients = [] } = useQuery<any[]>({
    queryKey: ['/api/clients'],
  });

  const { data: packages = [] } = useQuery<any[]>({
    queryKey: ['/api/packages'],
  });

  const packageById = packages.reduce((map: Record<string, any>, pkg) => {
    map[String(pkg._id)] = pkg;
    return map;
  }, {});

  const assignedClientIds = trainer?.assignedClients?.map((c: any) => 
    typeof c === 'object' ? String(c._id) : String(c)
  ) || [];

  const myClients = allClients
    .filter(client => assignedClientIds.includes(String(client._id)))
    .filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(client => {
      const packageId = typeof client.packageId === 'object' ? String(client.packageId._id) : String(client.packageId);
      return {
        ...client,
        packageData: packageById[packageId] || null
      };
    });

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                My Clients
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground">
                    Manage and track your assigned clients
                  </p>
                </div>
                <Badge className="bg-chart-1" data-testid="badge-total-clients">
                  <Users className="h-3 w-3 mr-1" />
                  {myClients.length} Active Clients
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md border bg-card">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0"
                  data-testid="input-search-clients"
                />
              </div>

              {myClients.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    {searchQuery ? 'No clients match your search' : 'No clients assigned yet'}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {myClients.map((client) => (
                    <Card key={client._id} data-testid={`card-client-${client._id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="font-display text-xl" data-testid="text-client-name">
                              {client.name}
                            </CardTitle>
                            {client.packageData && (
                              <Badge variant="outline" className="mt-2" data-testid="badge-package">
                                <Package className="h-3 w-3 mr-1" />
                                {client.packageData.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span data-testid="text-client-email">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span data-testid="text-client-phone">{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Joined {new Date(client.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Subscription: {client.subscriptionStatus || 'Active'}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setLocation(`/trainer/diet`)}
                            data-testid="button-assign-diet"
                          >
                            Assign Diet Plan
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setLocation(`/trainer/workouts`)}
                            data-testid="button-assign-workout"
                          >
                            Assign Workout
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
