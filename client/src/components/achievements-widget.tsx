import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Target, Star, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AchievementsWidget() {
  const achievements = [
    { id: 1, name: "First Workout", icon: Trophy, unlocked: true, color: "text-chart-1" },
    { id: 2, name: "7 Day Streak", icon: Flame, unlocked: true, color: "text-chart-2" },
    { id: 3, name: "10 Workouts", icon: Target, unlocked: true, color: "text-chart-3" },
    { id: 4, name: "30 Day Streak", icon: Star, unlocked: false, color: "text-muted-foreground" },
    { id: 5, name: "50 Workouts", icon: Award, unlocked: false, color: "text-muted-foreground" },
    { id: 6, name: "100 Workouts", icon: Zap, unlocked: false, color: "text-muted-foreground" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-display">Achievements</CardTitle>
          <Badge variant="outline">3/6</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-md border ${
                  achievement.unlocked ? "bg-accent/50" : "opacity-50"
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <Icon className={`h-8 w-8 ${achievement.color}`} />
                <p className="text-xs text-center font-medium">{achievement.name}</p>
              </div>
            );
          })}
        </div>
        <Button variant="outline" className="w-full" data-testid="button-view-all-achievements">
          View All Achievements
        </Button>
      </CardContent>
    </Card>
  );
}
