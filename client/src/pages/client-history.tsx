import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "@/components/notification-center";
import { Dumbbell, Video, UtensilsCrossed, Calendar, User, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function ClientHistory() {
  const [, setLocation] = useLocation();

  const weeklyData = [
    { week: "Week 1", workouts: 3, calories: 1850, duration: 135 },
    { week: "Week 2", workouts: 4, calories: 2100, duration: 180 },
    { week: "Week 3", workouts: 5, calories: 2450, duration: 225 },
    { week: "Week 4", workouts: 4, calories: 2200, duration: 200 },
  ];

  const recentWorkouts = [
    { id: 1, title: "Full Body Strength Training", date: "Nov 11, 2025", duration: "45 min", calories: 420, completed: true },
    { id: 2, title: "HIIT Cardio Blast", date: "Nov 10, 2025", duration: "25 min", calories: 380, completed: true },
    { id: 3, title: "Morning Yoga Flow", date: "Nov 9, 2025", duration: "30 min", calories: 180, completed: true },
    { id: 4, title: "Upper Body Power", date: "Nov 8, 2025", duration: "40 min", calories: 390, completed: true },
    { id: 5, title: "Core Strength Builder", date: "Nov 7, 2025", duration: "30 min", calories: 280, completed: true },
    { id: 6, title: "Evening Relaxation Yoga", date: "Nov 6, 2025", duration: "25 min", calories: 150, completed: true },
  ];

  const maxWorkouts = Math.max(...weeklyData.map(d => d.workouts));
  const totalWorkouts = recentWorkouts.length;
  const totalCalories = recentWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const totalDuration = recentWorkouts.reduce((sum, w) => sum + parseInt(w.duration), 0);

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
                <Button variant="ghost" onClick={() => setLocation("/client/diet")} data-testid="link-diet">
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
              <NotificationCenter />
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setLocation("/client/profile")} data-testid="button-profile">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Workout History</h1>
            <p className="text-muted-foreground mt-1">Track your fitness journey and progress over time</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workouts</p>
                    <p className="text-3xl font-bold font-display mt-1">{totalWorkouts}</p>
                  </div>
                  <CheckCircle2 className="h-10 w-10 text-chart-3" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Calories</p>
                    <p className="text-3xl font-bold font-display mt-1">{totalCalories}</p>
                  </div>
                  <Dumbbell className="h-10 w-10 text-chart-1" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="text-3xl font-bold font-display mt-1">{totalDuration}m</p>
                  </div>
                  <Clock className="h-10 w-10 text-chart-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Weekly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {weeklyData.map((week, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{week.week}</span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{week.workouts} workouts</span>
                        <span>{week.calories} cal</span>
                        <span>{week.duration} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div
                          className="bg-primary h-3 rounded-full transition-all"
                          style={{ width: `${(week.workouts / maxWorkouts) * 100}%` }}
                        />
                      </div>
                      {index < weeklyData.length - 1 && week.workouts < weeklyData[index + 1].workouts && (
                        <TrendingUp className="h-4 w-4 text-chart-3" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display">Recent Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center gap-4 p-4 rounded-md border hover-elevate"
                    data-testid={`workout-${workout.id}`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-chart-3" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{workout.title}</p>
                      <p className="text-sm text-muted-foreground">{workout.date}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{workout.duration}</Badge>
                      <Badge variant="outline">{workout.calories} cal</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
