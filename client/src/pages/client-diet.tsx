import { Button } from "@/components/ui/button";
import { ClientHeader } from "@/components/client-header";
import { DietPlanCard } from "@/components/diet-plan-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function ClientDiet() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  // Fetch diet plans for the logged-in client
  const { data: dietPlans, isLoading } = useQuery<any[]>({
    queryKey: ['/api/diet-plans/client', clientId],
    enabled: !!clientId,
  });

  const currentPlan = dietPlans?.[0]; // Get the first/current diet plan

  // Convert backend meals object to weekly plan format for UI
  const weeklyPlan = currentPlan?.meals ? [
    {
      day: "Daily Plan",
      meals: [
        { time: "7:00 AM", ...currentPlan.meals.breakfast },
        { time: "12:00 PM", ...currentPlan.meals.lunch },
        { time: "3:00 PM", ...currentPlan.meals.snack },
        { time: "7:00 PM", ...currentPlan.meals.dinner },
      ],
      totalCalories: currentPlan.targetCalories,
    },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="diet" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Your Diet Plan</h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-2">
                <span>Personalized meal plan -</span>
                <Badge className="bg-chart-2">Premium Plan</Badge>
              </div>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Loading your diet plan...
              </CardContent>
            </Card>
          ) : currentPlan ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-display">{currentPlan.name || 'Nutrition Goals'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold font-display text-primary">{currentPlan.targetCalories?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Daily Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold font-display text-chart-1">{currentPlan.protein}g</p>
                    <p className="text-sm text-muted-foreground mt-1">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold font-display text-chart-2">{currentPlan.carbs}g</p>
                    <p className="text-sm text-muted-foreground mt-1">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold font-display text-chart-3">{currentPlan.fats}g</p>
                    <p className="text-sm text-muted-foreground mt-1">Fats</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No diet plan assigned yet. Contact your trainer to get started!
              </CardContent>
            </Card>
          )}

          {currentPlan && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold tracking-tight">Daily Meal Plan</h2>
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {weeklyPlan.map((day) => (
                  <DietPlanCard
                    key={day.day}
                    day={day.day}
                    meals={day.meals}
                    totalCalories={day.totalCalories}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
