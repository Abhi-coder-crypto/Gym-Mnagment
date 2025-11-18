import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";

export default function TrainerWorkouts() {
  const { data: workoutPlans = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/workout-plans'],
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
                Workout Plans
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground">
                    Create and manage workout plans for your clients
                  </p>
                </div>
                <Badge className="bg-chart-3" data-testid="badge-total-plans">
                  {workoutPlans.length} Workout Plans
                </Badge>
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Loading workout plans...
                  </CardContent>
                </Card>
              ) : workoutPlans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    No workout plans created yet
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {workoutPlans.map((plan) => (
                    <Card key={plan._id} data-testid={`card-plan-${plan._id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="font-display" data-testid="text-plan-name">
                              {plan.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {plan.clientName || 'Not assigned'}
                            </CardDescription>
                          </div>
                          {plan.difficulty && (
                            <Badge variant="outline" data-testid="badge-difficulty">
                              {plan.difficulty}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description || plan.goal}
                        </p>
                        {plan.duration && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Duration:</span>
                            <span>{plan.duration} weeks</span>
                          </div>
                        )}
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
