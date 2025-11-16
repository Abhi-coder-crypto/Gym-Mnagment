import { ClientHeader } from "@/components/client-header";
import { LiveSessionCard } from "@/components/live-session-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";

export default function ClientSessions() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    type: 'all',
    trainer: 'all',
    availability: 'all',
    sortBy: 'date'
  });

  // Fetch real sessions from backend
  const { data: sessionsData, isLoading, isError } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
  });

  // Get unique values for filters
  const { sessionTypes, trainers } = useMemo(() => {
    if (!sessionsData) return { sessionTypes: [], trainers: [] };
    
    const types = new Set<string>();
    const trainerNames = new Set<string>();
    
    sessionsData.forEach(session => {
      if (session.sessionType) types.add(session.sessionType);
      if (session.trainer) trainerNames.add(session.trainer);
    });
    
    return {
      sessionTypes: Array.from(types),
      trainers: Array.from(trainerNames)
    };
  }, [sessionsData]);

  // Filter and format sessions by status
  const { upcomingSessions, liveSessions, completedSessions } = useMemo(() => {
    if (!sessionsData) return { upcomingSessions: [], liveSessions: [], completedSessions: [] };

    const formatSession = (session: any) => {
      const sessionDate = new Date(session.scheduledAt);
      return {
        id: session._id,
        title: session.title,
        trainer: session.trainer || "HOC Trainer",
        date: sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        duration: `${session.duration} min`,
        participants: session.currentParticipants || 0,
        maxParticipants: session.maxParticipants || 15,
        status: session.status,
        meetingLink: session.meetingLink,
        sessionType: session.sessionType,
        scheduledAt: session.scheduledAt,
      };
    };

    // Apply filters
    let filteredData = sessionsData;
    
    if (filters.type !== 'all') {
      filteredData = filteredData.filter(s => s.sessionType === filters.type);
    }
    
    if (filters.trainer !== 'all') {
      filteredData = filteredData.filter(s => s.trainer === filters.trainer);
    }
    
    if (filters.availability !== 'all') {
      if (filters.availability === 'available') {
        filteredData = filteredData.filter(s => 
          (s.currentParticipants || 0) < (s.maxParticipants || 15)
        );
      } else if (filters.availability === 'full') {
        filteredData = filteredData.filter(s => 
          (s.currentParticipants || 0) >= (s.maxParticipants || 15)
        );
      }
    }

    // Sort sessions
    const sorted = [...filteredData].sort((a, b) => {
      if (filters.sortBy === 'date') {
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      }
      return 0;
    });

    return {
      upcomingSessions: sorted
        .filter(s => s.status === 'upcoming')
        .map(formatSession),
      liveSessions: sorted
        .filter(s => s.status === 'live')
        .map(formatSession),
      completedSessions: sorted
        .filter(s => s.status === 'completed')
        .map(formatSession),
    };
  }, [sessionsData, filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="sessions" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Live Training Sessions</h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-2">
              <span>Join live sessions with certified trainers -</span>
              <Badge className="bg-chart-3">Elite Plan</Badge>
            </div>
          </div>

          {/* Filters Section */}
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-md border bg-card">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
              <SelectTrigger className="w-[180px]" data-testid="select-session-type">
                <SelectValue placeholder="Session Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {sessionTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.trainer} onValueChange={(value) => setFilters({...filters, trainer: value})}>
              <SelectTrigger className="w-[180px]" data-testid="select-trainer">
                <SelectValue placeholder="Trainer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {trainers.map(trainer => (
                  <SelectItem key={trainer} value={trainer}>{trainer}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.availability} onValueChange={(value) => setFilters({...filters, availability: value})}>
              <SelectTrigger className="w-[180px]" data-testid="select-availability">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="available">Available Spots</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value) => setFilters({...filters, sortBy: value})}>
              <SelectTrigger className="w-[180px]" data-testid="select-sort">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>

            {(filters.type !== 'all' || filters.trainer !== 'all' || filters.availability !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ type: 'all', trainer: 'all', availability: 'all', sortBy: 'date' })}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading sessions...
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-destructive">
              Failed to load sessions. Please refresh the page.
            </div>
          ) : (
            <>
              {liveSessions.length > 0 && (
                <div>
                  <h2 className="text-2xl font-display font-bold tracking-tight mb-6">Live Now</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveSessions.map((session: any) => (
                      <LiveSessionCard
                        key={session.id}
                        {...session}
                        onJoin={() => setLocation(`/session/${session.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight mb-6">Upcoming Sessions</h2>
                {upcomingSessions.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingSessions.map((session: any) => (
                      <LiveSessionCard
                        key={session.id}
                        {...session}
                        onJoin={() => setLocation(`/session/${session.id}`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming sessions scheduled
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight mb-6">Completed Sessions</h2>
                {completedSessions.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedSessions.map((session: any) => (
                      <LiveSessionCard key={session.id} {...session} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed sessions yet
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
