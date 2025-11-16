import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Video } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface WaitingRoomProps {
  session: {
    id: string;
    title: string;
    trainer: string;
    scheduledAt: string;
    participants: number;
    maxParticipants: number;
    meetingLink: string;
  };
  onJoinSession: () => void;
  onLeave: () => void;
}

export function WaitingRoom({ session, onJoinSession, onLeave }: WaitingRoomProps) {
  const [timeUntilStart, setTimeUntilStart] = useState("");
  const [progress, setProgress] = useState(0);
  const [canJoin, setCanJoin] = useState(false);

  useEffect(() => {
    const scheduledTime = new Date(session.scheduledAt);
    const fiveMinutesBefore = new Date(scheduledTime.getTime() - 5 * 60 * 1000);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = scheduledTime.getTime() - now.getTime();
      const fiveMinDiff = now.getTime() - fiveMinutesBefore.getTime();
      
      if (diff <= 0) {
        // Session has started
        setTimeUntilStart("Session is live!");
        setCanJoin(true);
        setProgress(100);
      } else if (now >= fiveMinutesBefore) {
        // Within 5 minutes of start
        setTimeUntilStart(`Starting in ${Math.ceil(diff / 1000)} seconds`);
        setCanJoin(true);
        const totalWaitTime = 5 * 60 * 1000; // 5 minutes in ms
        setProgress((fiveMinDiff / totalWaitTime) * 100);
      } else {
        setTimeUntilStart(formatDistanceToNow(scheduledTime, { addSuffix: true }));
        setProgress(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session.scheduledAt]);

  useEffect(() => {
    // Auto-redirect when session goes live - only if meetingLink exists
    if (canJoin && timeUntilStart === "Session is live!" && session.meetingLink) {
      const timer = setTimeout(() => {
        onJoinSession();
      }, 3000); // Auto-join after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [canJoin, timeUntilStart, onJoinSession, session.meetingLink]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center gap-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">{session.title}</CardTitle>
          <p className="text-muted-foreground">with {session.trainer}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>Scheduled for {format(new Date(session.scheduledAt), 'PPp')}</span>
            </div>
            
            <div className="text-3xl font-bold text-primary">
              {timeUntilStart}
            </div>
          </div>

          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                You can join the session shortly
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 p-4 rounded-md bg-muted">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {session.participants}/{session.maxParticipants}
              </span>
              <span className="text-sm text-muted-foreground">participants</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={onJoinSession}
              disabled={!canJoin || !session.meetingLink}
              data-testid="button-join-from-waiting-room"
            >
              <Video className="h-5 w-5 mr-2" />
              {!session.meetingLink ? "No meeting link available" : (canJoin ? "Join Session Now" : "Waiting for session to start...")}
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={onLeave}
              data-testid="button-leave-waiting-room"
            >
              Leave Waiting Room
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Please ensure you have a stable internet connection</p>
            <p>You'll automatically join when the session goes live</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
