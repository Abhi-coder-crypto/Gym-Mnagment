import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, Video, Trophy, UtensilsCrossed } from "lucide-react";

export function NotificationCenter() {
  const notifications = [
    { id: 1, type: "session", icon: Calendar, title: "Upcoming Live Session", message: "Power Yoga starts in 2 hours", time: "2h", unread: true },
    { id: 2, type: "achievement", icon: Trophy, title: "Achievement Unlocked!", message: "7 Day Streak completed", time: "3h", unread: true },
    { id: 3, type: "video", icon: Video, title: "New Video Available", message: "Advanced HIIT Circuit is now available", time: "1d", unread: false },
    { id: 4, type: "diet", icon: UtensilsCrossed, title: "Diet Plan Updated", message: "Your meal plan has been adjusted", time: "2d", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-chart-2">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" data-testid="button-mark-all-read">
                Mark all read
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`p-3 rounded-md border hover-elevate cursor-pointer ${
                    notification.unread ? "bg-accent/50" : ""
                  }`}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="outline" className="w-full" data-testid="button-view-all-notifications">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
