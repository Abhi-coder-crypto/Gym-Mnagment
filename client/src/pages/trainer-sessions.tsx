import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Users, Video } from "lucide-react";
import { format } from "date-fns";

export default function TrainerSessions() {
  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/live-sessions'],
  });

  const upcomingSessions = sessions.filter(s => 
    new Date(s.date) > new Date() && s.status !== 'completed'
  );

  const pastSessions = sessions.filter(s => 
    s.status === 'completed' || new Date(s.date) < new Date()
  );

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
                Live Sessions
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground">
                    Manage your scheduled training sessions
                  </p>
                </div>
                <Badge className="bg-chart-1" data-testid="badge-upcoming">
                  {upcomingSessions.length} Upcoming
                </Badge>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Upcoming Sessions</h2>
                  {isLoading ? (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        Loading sessions...
                      </CardContent>
                    </Card>
                  ) : upcomingSessions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        No upcoming sessions scheduled
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {upcomingSessions.map((session) => (
                        <Card key={session._id} data-testid={`card-session-${session._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <CardTitle className="font-display" data-testid="text-session-title">
                                {session.title}
                              </CardTitle>
                              <Badge className="bg-chart-1" data-testid="badge-type">
                                {session.type}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{format(new Date(session.date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{session.time} ({session.duration})</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {session.currentParticipants || 0}/{session.maxParticipants} participants
                              </span>
                            </div>
                            {session.meetingLink && (
                              <div className="flex items-center gap-2 text-sm">
                                <Video className="h-4 w-4 text-muted-foreground" />
                                <span className="text-chart-1">Meeting link ready</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Past Sessions</h2>
                  {pastSessions.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        No past sessions
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      {pastSessions.slice(0, 6).map((session) => (
                        <Card key={session._id} data-testid={`card-past-session-${session._id}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                              <CardTitle className="font-display text-muted-foreground" data-testid="text-past-session-title">
                                {session.title}
                              </CardTitle>
                              <Badge variant="secondary" data-testid="badge-completed">
                                Completed
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3 text-muted-foreground">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(session.date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4" />
                              <span>
                                {session.currentParticipants || 0} participants
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
