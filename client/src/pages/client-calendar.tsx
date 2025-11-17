import { ClientHeader } from "@/components/client-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, Dumbbell, Target, Trophy, Clock } from "lucide-react";
import { useLocation } from "wouter";

interface LiveSession {
  _id: string;
  title: string;
  description: string;
  scheduledAt: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  trainerId: {
    name: string;
  };
}

interface WorkoutSession {
  _id: string;
  workoutPlanId: {
    name: string;
  };
  date: string;
  completed: boolean;
  duration: number;
}

interface Goal {
  _id: string;
  goalType: 'weight' | 'fitness' | 'nutrition';
  title: string;
  targetDate: string;
  progress: number;
  status: 'active' | 'completed' | 'abandoned';
  milestones: Array<{
    description: string;
    targetValue: number;
    achieved: boolean;
    achievedAt?: string;
  }>;
}

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: 'session' | 'workout' | 'goal' | 'milestone';
  status: string;
  icon: any;
  color: string;
  bgColor: string;
  data: any;
};

export default function ClientCalendar() {
  const [, setLocation] = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  const { data: sessions = [] } = useQuery<LiveSession[]>({
    queryKey: ['/api/sessions/my-sessions'],
  });

  const { data: workouts = [] } = useQuery<WorkoutSession[]>({
    queryKey: ['/api/workout-sessions'],
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  // Transform all data into calendar events
  const allEvents: CalendarEvent[] = [
    // Live sessions
    ...sessions.map(session => ({
      id: session._id,
      title: session.title,
      date: parseISO(session.scheduledAt),
      type: 'session' as const,
      status: session.status,
      icon: Video,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      data: session,
    })),
    // Workouts
    ...workouts.map(workout => ({
      id: workout._id,
      title: workout.workoutPlanId?.name || 'Workout',
      date: parseISO(workout.date),
      type: 'workout' as const,
      status: workout.completed ? 'completed' : 'pending',
      icon: Dumbbell,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
      data: workout,
    })),
    // Goal deadlines
    ...goals.filter(goal => goal.status === 'active').map(goal => ({
      id: goal._id,
      title: goal.title,
      date: parseISO(goal.targetDate),
      type: 'goal' as const,
      status: goal.status,
      icon: Target,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      data: goal,
    })),
    // Achieved milestones
    ...goals.flatMap(goal =>
      goal.milestones
        .filter(m => m.achieved && m.achievedAt)
        .map(milestone => ({
          id: `${goal._id}-${milestone.description}`,
          title: milestone.description,
          date: parseISO(milestone.achievedAt!),
          type: 'milestone' as const,
          status: 'achieved',
          icon: Trophy,
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-100 dark:bg-purple-900',
          data: { ...milestone, goalTitle: goal.title },
        }))
    ),
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return allEvents.filter(event => isSameDay(event.date, day));
  };

  const handleDateClick = (day: Date) => {
    const events = getEventsForDay(day);
    if (events.length > 0) {
      setSelectedDate(day);
      setSelectedEvents(events);
    }
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const upcomingSessions = sessions
    .filter(s => s.status === 'upcoming' && new Date(s.scheduledAt) > new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader currentPage="calendar" />
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <CalendarIcon className="h-8 w-8 text-primary" />
            My Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your sessions, workouts, and fitness goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                    data-testid="button-today"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevMonth}
                    data-testid="button-prev-month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextMonth}
                    data-testid="button-next-month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, idx) => {
                  const events = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelectedDay = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(day)}
                      className={`
                        min-h-24 p-2 rounded-lg border transition-all
                        ${isCurrentMonth ? 'bg-card' : 'bg-muted/50'}
                        ${isToday(day) ? 'border-primary border-2' : 'border-border'}
                        ${isSelectedDay ? 'ring-2 ring-primary' : ''}
                        ${events.length > 0 ? 'hover-elevate cursor-pointer' : 'cursor-default'}
                        ${!isCurrentMonth ? 'opacity-50' : ''}
                      `}
                      data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                    >
                      <div className="text-sm font-semibold mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {events.slice(0, 2).map((event, i) => {
                          const Icon = event.icon;
                          return (
                            <div
                              key={i}
                              className={`text-xs rounded px-1 py-0.5 flex items-center gap-1 ${event.bgColor} ${event.color}`}
                            >
                              <Icon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{event.title}</span>
                            </div>
                          );
                        })}
                        {events.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-muted-foreground">Live Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-muted-foreground">Workouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-muted-foreground">Goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-muted-foreground">Milestones</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Upcoming Sessions */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Upcoming Sessions
                </h3>
                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming sessions
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map(session => (
                      <div
                        key={session._id}
                        className="p-3 rounded-lg bg-accent/50 hover-elevate cursor-pointer"
                        onClick={() => setLocation(`/session/${session._id}`)}
                        data-testid={`upcoming-session-${session._id}`}
                      >
                        <div className="flex items-start gap-2 mb-1">
                          <Video className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm line-clamp-1">
                              {session.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(parseISO(session.scheduledAt), 'MMM d, h:mm a')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              with {session.trainerId?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">This Month</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sessions</span>
                    <Badge variant="secondary">
                      {allEvents.filter(e => e.type === 'session' && isSameMonth(e.date, currentMonth)).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Workouts</span>
                    <Badge variant="secondary">
                      {allEvents.filter(e => e.type === 'workout' && isSameMonth(e.date, currentMonth)).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Milestones</span>
                    <Badge variant="secondary">
                      {allEvents.filter(e => e.type === 'milestone' && isSameMonth(e.date, currentMonth)).length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Day Details Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} on this day
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedEvents.map((event, idx) => {
              const Icon = event.icon;
              return (
                <Card key={idx} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${event.bgColor}`}>
                        <Icon className={`h-5 w-5 ${event.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold">{event.title}</h4>
                          <Badge variant="outline" className={event.color}>
                            {event.type}
                          </Badge>
                        </div>
                        {event.type === 'session' && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Time: {format(event.date, 'h:mm a')}</p>
                            <p>Trainer: {event.data.trainerId?.name}</p>
                            <p>Duration: {event.data.duration} minutes</p>
                            {event.data.description && (
                              <p className="mt-2">{event.data.description}</p>
                            )}
                          </div>
                        )}
                        {event.type === 'workout' && (
                          <div className="text-sm text-muted-foreground">
                            <p>Duration: {event.data.duration} minutes</p>
                            <Badge
                              variant={event.data.completed ? 'default' : 'secondary'}
                              className="mt-2"
                            >
                              {event.data.completed ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                        )}
                        {event.type === 'goal' && (
                          <div className="text-sm text-muted-foreground">
                            <p>Target Date: {format(event.date, 'MMM d, yyyy')}</p>
                            <p>Progress: {event.data.progress}%</p>
                          </div>
                        )}
                        {event.type === 'milestone' && (
                          <div className="text-sm text-muted-foreground">
                            <p>Goal: {event.data.goalTitle}</p>
                            <p>Achieved: {format(event.date, 'MMM d, yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
