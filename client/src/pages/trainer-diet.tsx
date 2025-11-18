import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UtensilsCrossed, Users, BookTemplate, Plus } from "lucide-react";
import { AssignPlanDialog } from "@/components/assign-plan-dialog";

export default function TrainerDiet() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const { data: dietPlans = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/diet-plans-with-assignments'],
  });

  const { data: templates = [] } = useQuery<any[]>({
    queryKey: ['/api/diet-plan-templates'],
  });

  const handleAssignPlan = (plan: any) => {
    setSelectedPlan(plan);
    setAssignDialogOpen(true);
  };

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
                Diet Plan Management
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <Tabs defaultValue="assignments" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="assignments" data-testid="tab-assignments">
                    <Users className="h-4 w-4 mr-2" />
                    Client Assignments
                  </TabsTrigger>
                  <TabsTrigger value="templates" data-testid="tab-templates">
                    <BookTemplate className="h-4 w-4 mr-2" />
                    Plan Templates
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="assignments" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      View and manage diet plans assigned to your clients
                    </p>
                    <Badge className="bg-chart-2" data-testid="badge-total-assignments">
                      {dietPlans.length} Assigned Plans
                    </Badge>
                  </div>

                  {isLoading ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Loading diet plans...
                      </CardContent>
                    </Card>
                  ) : dietPlans.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        No diet plans assigned yet
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {dietPlans.map((plan) => (
                        <Card key={plan._id} data-testid={`card-plan-${plan._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="font-display" data-testid="text-plan-name">
                                  {plan.name}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  Assigned to: {plan.clientName || 'Unknown Client'}
                                </CardDescription>
                              </div>
                              <Badge className="bg-chart-1" data-testid="badge-calories">
                                {plan.dailyCalories || plan.targetCalories} cal
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Category:</span>
                              <Badge variant="outline" data-testid="badge-category">
                                {plan.category}
                              </Badge>
                            </div>
                            {plan.status && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge 
                                  variant={plan.status === 'active' ? 'default' : 'secondary'}
                                  data-testid="badge-status"
                                >
                                  {plan.status}
                                </Badge>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {plan.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">
                      Use these templates to quickly assign diet plans to your clients
                    </p>
                  </div>

                  {templates.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <BookTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        No templates available
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {templates.map((template) => (
                        <Card key={template._id} data-testid={`card-template-${template._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="font-display" data-testid="text-template-name">
                                  {template.name}
                                </CardTitle>
                              </div>
                              <Badge className="bg-chart-1" data-testid="badge-template-calories">
                                {template.dailyCalories || template.targetCalories} cal
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Category:</span>
                              <Badge variant="outline" data-testid="badge-template-category">
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                            <Button 
                              className="w-full" 
                              variant="outline"
                              onClick={() => handleAssignPlan(template)}
                              data-testid="button-assign-template"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Assign to Client
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      <AssignPlanDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        plan={selectedPlan}
      />
    </SidebarProvider>
  );
}
