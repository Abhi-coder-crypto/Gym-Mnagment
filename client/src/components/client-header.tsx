import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/notification-center";
import { CalculatorDialog } from "@/components/calculator-dialog";
import { SessionReminders } from "@/components/session-reminders";
import { Dumbbell, Calendar, Video, UtensilsCrossed, User, History, Image } from "lucide-react";
import { useLocation } from "wouter";

interface ClientHeaderProps {
  currentPage?: 'dashboard' | 'workouts' | 'videos' | 'diet' | 'sessions' | 'history' | 'workout-history' | 'progress' | 'profile';
}

export function ClientHeader({ currentPage }: ClientHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLocation("/")} 
              className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1"
              data-testid="button-logo-home"
            >
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
            </button>
            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                className={currentPage === 'dashboard' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client")}
                data-testid="link-dashboard"
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className={currentPage === 'sessions' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/sessions")} 
                data-testid="link-sessions"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Sessions
              </Button>
              <Button 
                variant="ghost" 
                className={currentPage === 'videos' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/videos")} 
                data-testid="link-videos"
              >
                <Video className="h-4 w-4 mr-2" />
                Videos
              </Button>
              <Button 
                variant="ghost" 
                className={currentPage === 'diet' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/diet")} 
                data-testid="link-diet"
              >
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Diet & Nutrition
              </Button>
              <Button 
                variant="ghost" 
                className={currentPage === 'workout-history' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/workout-history")} 
                data-testid="link-workout-history"
              >
                <History className="h-4 w-4 mr-2" />
                Workout History
              </Button>
              <Button 
                variant="ghost" 
                className={currentPage === 'progress' ? 'bg-accent' : ''} 
                onClick={() => setLocation("/client/progress-photos")} 
                data-testid="link-progress-photos"
              >
                <Image className="h-4 w-4 mr-2" />
                Progress Photos
              </Button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <CalculatorDialog />
            <SessionReminders />
            <NotificationCenter />
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation("/client/profile")} 
              data-testid="button-profile"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
