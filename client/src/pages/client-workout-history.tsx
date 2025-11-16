import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, CheckCircle2, Clock, Dumbbell, Calendar, Flame, StickyNote } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface WorkoutSession {
  _id: string;
  workoutName: string;
  duration: number;
  caloriesBurned: number;
  completedAt: string;
  notes?: string;
  exercises?: any;
}

export default function ClientWorkoutHistory() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: sessions = [], isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ['/api/workout-sessions', clientId],
    enabled: !!clientId,
  });

  const stats = {
    totalWorkouts: sessions.length,
    totalCalories: sessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
    totalDuration: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
    avgCaloriesPerWorkout: sessions.length > 0 
      ? Math.round(sessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0) / sessions.length)
      : 0,
  };

  const getWeeklyData = () => {
    const weeklyMap = new Map<string, { workouts: number; calories: number; duration: number }>();
    
    sessions.forEach(session => {
      const date = new Date(session.completedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = format(weekStart, 'MMM dd');
      
      const existing = weeklyMap.get(weekKey) || { workouts: 0, calories: 0, duration: 0 };
      weeklyMap.set(weekKey, {
        workouts: existing.workouts + 1,
        calories: existing.calories + (session.caloriesBurned || 0),
        duration: existing.duration + (session.duration || 0),
      });
    });

    return Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, ...data }))
      .slice(-4);
  };

  const weeklyData = getWeeklyData();
  const maxWorkouts = weeklyData.length > 0 ? Math.max(...weeklyData.map(d => d.workouts)) : 1;

  if (!clientId) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="history" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Workout History</h1>
            <p className="text-muted-foreground mt-1">Track your fitness journey and progress over time</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workouts</p>
                    <p className="text-3xl font-bold font-display mt-1" data-testid="text-total-workouts">
                      {stats.totalWorkouts}
                    </p>
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
                    <p className="text-3xl font-bold font-display mt-1" data-testid="text-total-calories">
                      {stats.totalCalories.toLocaleString()}
                    </p>
                  </div>
                  <Flame className="h-10 w-10 text-chart-1" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Duration</p>
                    <p className="text-3xl font-bold font-display mt-1" data-testid="text-total-duration">
                      {stats.totalDuration}m
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-chart-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Calories</p>
                    <p className="text-3xl font-bold font-display mt-1" data-testid="text-avg-calories">
                      {stats.avgCaloriesPerWorkout}
                    </p>
                  </div>
                  <Dumbbell className="h-10 w-10 text-chart-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {weeklyData.length > 0 && (
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
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="font-display">Workout Sessions</CardTitle>
                <Badge variant="secondary">{sessions.length} sessions completed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading workout sessions...
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <Dialog key={session._id}>
                      <DialogTrigger asChild>
                        <div
                          className="flex items-center gap-4 p-4 rounded-md border hover-elevate cursor-pointer"
                          data-testid={`workout-session-${session._id}`}
                          onClick={() => setSelectedSession(session)}
                        >
                          <CheckCircle2 className="h-5 w-5 text-chart-3 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{session.workoutName}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.completedAt), 'MMM dd, yyyy • h:mm a')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {session.duration} min
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Flame className="h-4 w-4" />
                              {session.caloriesBurned} cal
                            </div>
                            {session.notes && (
                              <Badge variant="outline" className="gap-1">
                                <StickyNote className="h-3 w-3" />
                                Notes
                              </Badge>
                            )}
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="font-display">Workout Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-semibold text-lg">{session.workoutName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(session.completedAt), 'MMMM dd, yyyy • h:mm a')}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardContent className="pt-6 text-center">
                                <Clock className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                                <p className="text-2xl font-bold">{session.duration}</p>
                                <p className="text-sm text-muted-foreground">minutes</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-6 text-center">
                                <Flame className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                                <p className="text-2xl font-bold">{session.caloriesBurned}</p>
                                <p className="text-sm text-muted-foreground">calories</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-6 text-center">
                                <Dumbbell className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                                <p className="text-2xl font-bold">
                                  {session.exercises?.length || 0}
                                </p>
                                <p className="text-sm text-muted-foreground">exercises</p>
                              </CardContent>
                            </Card>
                          </div>

                          {session.notes && (
                            <div>
                              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                <StickyNote className="h-4 w-4" />
                                Workout Notes
                              </label>
                              <div className="p-4 rounded-md bg-muted">
                                <p className="text-sm whitespace-pre-wrap">{session.notes}</p>
                              </div>
                            </div>
                          )}

                          {session.exercises && session.exercises.length > 0 && (
                            <div>
                              <label className="text-sm font-medium mb-2 block">Exercises Performed</label>
                              <div className="space-y-2">
                                {session.exercises.map((exercise: any, index: number) => (
                                  <div key={index} className="p-3 rounded-md border">
                                    <p className="font-medium">{exercise.name || `Exercise ${index + 1}`}</p>
                                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                                      {exercise.sets && <span>{exercise.sets} sets</span>}
                                      {exercise.reps && <span>{exercise.reps} reps</span>}
                                      {exercise.weight && <span>{exercise.weight} lbs</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No workout sessions yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your completed workouts will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
