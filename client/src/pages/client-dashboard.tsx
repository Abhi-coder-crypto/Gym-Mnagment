import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { StatCard } from "@/components/stat-card";
import { VideoCard } from "@/components/video-card";
import { LiveSessionCard } from "@/components/live-session-card";
import { ProgressTracker } from "@/components/progress-tracker";
import { AchievementsWidget } from "@/components/achievements-widget";
import { VideoPlayerModal } from "@/components/video-player-modal";
import { NotificationCenter } from "@/components/notification-center";
import { Dumbbell, Flame, Trophy, Calendar, Video, UtensilsCrossed, User, History } from "lucide-react";
import strengthImage from "@assets/generated_images/Strength_training_video_thumbnail_e7f2ebd6.png";
import yogaImage from "@assets/generated_images/Yoga_class_video_thumbnail_a8a89f8b.png";
import cardioImage from "@assets/generated_images/Cardio_workout_video_thumbnail_2c386154.png";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useState } from "react";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const [videoModal, setVideoModal] = useState({ open: false, title: "", category: "", duration: "", thumbnail: "" });

  const videos = [
    { id: 1, title: "Full Body Strength Training", category: "Strength", duration: "45 min", thumbnail: strengthImage },
    { id: 2, title: "Morning Yoga Flow", category: "Yoga", duration: "30 min", thumbnail: yogaImage },
    { id: 3, title: "HIIT Cardio Blast", category: "Cardio", duration: "25 min", thumbnail: cardioImage },
  ];

  const handleVideoPlay = (video: typeof videos[0]) => {
    setVideoModal({ open: true, ...video });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-8 w-8 text-primary" />
                <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" className="bg-accent" data-testid="link-dashboard">
                  Dashboard
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/workouts")} data-testid="link-workouts">
                  <Video className="h-4 w-4 mr-2" />
                  Workouts
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/diet")} data-testid="link-diet">
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Diet Plan
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/sessions")} data-testid="link-sessions">
                  <Calendar className="h-4 w-4 mr-2" />
                  Live Sessions
                </Button>
                <Button variant="ghost" onClick={() => setLocation("/client/history")} data-testid="link-history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setLocation("/client/profile")} data-testid="button-profile">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Welcome back, John!</h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-2">
                <span>You're on the</span>
                <Badge className="bg-chart-2">Premium Plan</Badge>
              </div>
            </div>
            <Button data-testid="button-start-workout">
              <Dumbbell className="h-4 w-4 mr-2" />
              Start Workout
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Workout Streak" value="12 days" icon={Flame} trend="Keep it up!" trendUp={true} />
            <StatCard title="Sessions Completed" value={34} icon={Trophy} trend="+5 this week" trendUp={true} />
            <StatCard title="Calories Burned" value="2,450" icon={Dumbbell} trend="This week" trendUp={true} />
            <StatCard title="Next Session" value="Today 6PM" icon={Calendar} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold tracking-tight mb-6">Continue Watching</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      title={video.title}
                      category={video.category}
                      duration={video.duration}
                      thumbnail={video.thumbnail}
                      onPlay={() => handleVideoPlay(video)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-bold tracking-tight">Upcoming Live Sessions</h2>
                  <Button variant="outline" onClick={() => setLocation("/client/sessions")} data-testid="button-view-all-sessions">
                    View All
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <LiveSessionCard
                    title="Power Yoga Session"
                    trainer="Sarah Johnson"
                    date="Nov 12, 2025"
                    time="6:00 PM"
                    duration="60 min"
                    participants={8}
                    maxParticipants={15}
                    status="upcoming"
                    onJoin={() => console.log("Joining upcoming session")}
                  />
                  <LiveSessionCard
                    title="HIIT Training"
                    trainer="Mike Chen"
                    date="Nov 11, 2025"
                    time="7:00 PM"
                    duration="45 min"
                    participants={12}
                    maxParticipants={15}
                    status="live"
                    onJoin={() => console.log("Joining live session")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <ProgressTracker />
              <AchievementsWidget />
            </div>
          </div>
        </div>
      </main>

      <VideoPlayerModal
        open={videoModal.open}
        onOpenChange={(open) => setVideoModal({ ...videoModal, open })}
        videoTitle={videoModal.title}
        videoCategory={videoModal.category}
        videoDuration={videoModal.duration}
        videoThumbnail={videoModal.thumbnail}
      />
    </div>
  );
}
