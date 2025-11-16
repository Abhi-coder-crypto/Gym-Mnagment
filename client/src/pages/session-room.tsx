import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { WaitingRoom } from "@/components/waiting-room";
import { LiveChat } from "@/components/live-chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SessionRoom() {
  const [, params] = useRoute("/session/:id");
  const [, setLocation] = useLocation();
  const [inWaitingRoom, setInWaitingRoom] = useState(true);
  const [clientId] = useState(localStorage.getItem('clientId') || '');
  const [clientName] = useState(localStorage.getItem('clientName') || 'User');

  const { data: session, isLoading } = useQuery<any>({
    queryKey: ['/api/sessions/' + params?.id],
    enabled: !!params?.id,
  });

  useEffect(() => {
    if (!clientId) {
      setLocation('/client-access');
    }
  }, [clientId, setLocation]);

  const handleJoinSession = () => {
    if (session?.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
    setInWaitingRoom(false);
  };

  const handleLeave = () => {
    setLocation('/client/sessions');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Loading session...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-lg text-destructive">Session not found</div>
          <Button onClick={handleLeave}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const formattedSession = {
    id: session._id,
    title: session.title,
    trainer: session.trainer || "HOC Trainer",
    scheduledAt: session.scheduledAt,
    participants: session.currentParticipants || 0,
    maxParticipants: session.maxParticipants || 15,
    meetingLink: session.meetingLink || '',
  };

  if (inWaitingRoom) {
    return (
      <WaitingRoom
        session={formattedSession}
        onJoinSession={handleJoinSession}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">{session.title}</h1>
            <p className="text-muted-foreground">with {formattedSession.trainer}</p>
          </div>
          <Button variant="outline" onClick={handleLeave} data-testid="button-leave-session">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Session
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
              {session.meetingLink ? (
                <div className="text-center space-y-4">
                  <p className="text-lg text-muted-foreground">
                    The live session is happening in a separate window
                  </p>
                  <Button onClick={() => window.open(session.meetingLink, '_blank')}>
                    Open Session Window
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">No meeting link available</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <LiveChat
              sessionId={session._id}
              userId={clientId}
              userName={clientName}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
