import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";

export default function AdminDiet() {
  const style = { "--sidebar-width": "16rem" };

  const dietPlans = [
    { id: 1, name: "Weight Loss Plan", calories: 1800, assignedTo: 24, meals: 4, type: "Low Carb" },
    { id: 2, name: "Muscle Gain Plan", calories: 2800, assignedTo: 18, meals: 6, type: "High Protein" },
    { id: 3, name: "Balanced Maintenance", calories: 2200, assignedTo: 35, meals: 5, type: "Balanced" },
    { id: 4, name: "Keto Diet Plan", calories: 1900, assignedTo: 12, meals: 4, type: "Ketogenic" },
    { id: 5, name: "Vegan Athlete Plan", calories: 2500, assignedTo: 8, meals: 5, type: "Vegan" },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Diet Plans</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Manage and assign custom diet plans to clients</p>
                <Button data-testid="button-create-plan">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Plan
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dietPlans.map((plan) => (
                  <Card key={plan.id} data-testid={`card-diet-plan-${plan.id}`}>
                    <CardHeader>
                      <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                      <Badge variant="outline" className="w-fit">{plan.type}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Daily Calories</span>
                          <span className="font-semibold">{plan.calories} cal</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Meals per Day</span>
                          <span className="font-semibold">{plan.meals}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Assigned to
                          </span>
                          <span className="font-semibold">{plan.assignedTo} clients</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" size="sm" data-testid="button-edit-plan">
                          Edit
                        </Button>
                        <Button variant="outline" className="flex-1" size="sm" data-testid="button-assign-plan">
                          Assign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
