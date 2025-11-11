import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LiveSessionCard } from "@/components/live-session-card";
import { Plus } from "lucide-react";

export default function AdminSessions() {
  const style = { "--sidebar-width": "16rem" };

  const sessions = [
    { id: 1, title: "Power Yoga Session", trainer: "Sarah Johnson", date: "Nov 12, 2025", time: "6:00 PM", duration: "60 min", participants: 8, maxParticipants: 15, status: "upcoming" as const },
    { id: 2, title: "HIIT Training", trainer: "Mike Chen", date: "Nov 11, 2025", time: "7:00 PM", duration: "45 min", participants: 12, maxParticipants: 15, status: "live" as const },
    { id: 3, title: "Strength Building", trainer: "Alex Rivera", date: "Nov 10, 2025", time: "5:30 PM", duration: "50 min", participants: 14, maxParticipants: 15, status: "completed" as const },
    { id: 4, title: "Cardio Bootcamp", trainer: "Sarah Johnson", date: "Nov 13, 2025", time: "7:30 AM", duration: "40 min", participants: 5, maxParticipants: 20, status: "upcoming" as const },
    { id: 5, title: "Flexibility Training", trainer: "Mike Chen", date: "Nov 14, 2025", time: "8:00 PM", duration: "30 min", participants: 10, maxParticipants: 12, status: "upcoming" as const },
    { id: 6, title: "Core Workout", trainer: "Alex Rivera", date: "Nov 9, 2025", time: "6:00 PM", duration: "35 min", participants: 15, maxParticipants: 15, status: "completed" as const },
  ];

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Live Sessions</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Schedule and manage live training sessions</p>
                <Button data-testid="button-schedule-session">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                  <LiveSessionCard
                    key={session.id}
                    {...session}
                    onJoin={() => console.log(`Managing session: ${session.title}`)}
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
