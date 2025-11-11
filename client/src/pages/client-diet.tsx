import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DietPlanCard } from "@/components/diet-plan-card";
import { Dumbbell, Video, UtensilsCrossed, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function ClientDiet() {
  const [, setLocation] = useLocation();

  const weeklyPlan = [
    {
      day: "Monday",
      meals: [
        { time: "7:00 AM", name: "Protein Oatmeal Bowl", calories: 420, protein: 25, carbs: 55, fats: 12 },
        { time: "12:00 PM", name: "Grilled Chicken Salad", calories: 550, protein: 45, carbs: 35, fats: 18 },
        { time: "3:00 PM", name: "Greek Yogurt & Berries", calories: 220, protein: 18, carbs: 28, fats: 5 },
        { time: "7:00 PM", name: "Salmon with Quinoa", calories: 680, protein: 42, carbs: 52, fats: 28 },
      ],
      totalCalories: 1870,
    },
    {
      day: "Tuesday",
      meals: [
        { time: "7:00 AM", name: "Scrambled Eggs & Toast", calories: 380, protein: 22, carbs: 42, fats: 14 },
        { time: "12:00 PM", name: "Turkey Wrap", calories: 520, protein: 38, carbs: 48, fats: 16 },
        { time: "3:00 PM", name: "Protein Shake", calories: 250, protein: 30, carbs: 20, fats: 6 },
        { time: "7:00 PM", name: "Chicken Stir Fry", calories: 620, protein: 46, carbs: 58, fats: 22 },
      ],
      totalCalories: 1770,
    },
    {
      day: "Wednesday",
      meals: [
        { time: "7:00 AM", name: "Smoothie Bowl", calories: 400, protein: 20, carbs: 62, fats: 10 },
        { time: "12:00 PM", name: "Tuna Salad", calories: 480, protein: 42, carbs: 28, fats: 22 },
        { time: "3:00 PM", name: "Almonds & Apple", calories: 200, protein: 8, carbs: 24, fats: 12 },
        { time: "7:00 PM", name: "Beef & Vegetables", calories: 720, protein: 48, carbs: 45, fats: 32 },
      ],
      totalCalories: 1800,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/client")}>
                <Dumbbell className="h-8 w-8 text-primary" />
                <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" onClick={() => setLocation("/client")} data-testid="link-dashboard">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/workouts")} data-testid="link-workouts">
                  <Video className="h-4 w-4 mr-2" />
                  Workouts
                </Button>
                <Button variant="ghost" className="bg-accent" data-testid="link-diet">
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Diet Plan
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/sessions")} data-testid="link-sessions">
                  <Calendar className="h-4 w-4 mr-2" />
                  Live Sessions
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" data-testid="button-profile">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Nutrition Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-primary">1,850</p>
                  <p className="text-sm text-muted-foreground mt-1">Daily Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-chart-1">140g</p>
                  <p className="text-sm text-muted-foreground mt-1">Protein</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-chart-2">180g</p>
                  <p className="text-sm text-muted-foreground mt-1">Carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold font-display text-chart-3">68g</p>
                  <p className="text-sm text-muted-foreground mt-1">Fats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-display font-bold tracking-tight">Weekly Meal Plan</h2>
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
        </div>
      </main>
    </div>
  );
}
