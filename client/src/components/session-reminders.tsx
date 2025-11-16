import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SessionReminders() {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  const { data: sessions } = useQuery<any[]>({
    queryKey: ['/api/sessions'],
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!sessions || permission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const reminderTime = 10 * 60 * 1000; // 10 minutes before

      sessions.forEach(session => {
        if (session.status === 'upcoming' && !reminders.has(session._id)) {
          const sessionTime = new Date(session.scheduledAt);
          const timeDiff = sessionTime.getTime() - now.getTime();
          
          // Send notification 10 minutes before session
          if (timeDiff > 0 && timeDiff <= reminderTime) {
            new Notification('Upcoming Live Session', {
              body: `${session.title} starts in ${Math.round(timeDiff / 60000)} minutes!`,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: session._id,
            });
            
            setReminders(prev => new Set(prev).add(session._id));
            
            toast({
              title: "Session Starting Soon!",
              description: `${session.title} starts in ${Math.round(timeDiff / 60000)} minutes`,
            });
          }
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [sessions, permission, toast]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast({
        title: "Notifications Enabled",
        description: "You'll receive reminders before your sessions start",
      });
    }
  };

  if (!('Notification' in window)) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={requestPermission}
      disabled={permission === 'granted'}
      data-testid="button-enable-reminders"
      title={permission === 'granted' ? 'Reminders enabled' : 'Enable session reminders'}
    >
      {permission === 'granted' ? (
        <Bell className="h-5 w-5 text-chart-3" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </Button>
  );
}
