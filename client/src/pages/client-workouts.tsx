import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { VideoCard } from "@/components/video-card";
import { Dumbbell, Video, UtensilsCrossed, Calendar, User, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import strengthImage from "@assets/generated_images/Strength_training_video_thumbnail_e7f2ebd6.png";
import yogaImage from "@assets/generated_images/Yoga_class_video_thumbnail_a8a89f8b.png";
import cardioImage from "@assets/generated_images/Cardio_workout_video_thumbnail_2c386154.png";
import { useLocation } from "wouter";

export default function ClientWorkouts() {
  const [, setLocation] = useLocation();

  const categories = ["All", "Strength", "Cardio", "Yoga", "HIIT"];
  const videos = [
    { id: 1, title: "Full Body Strength Training", category: "Strength", duration: "45 min", thumbnail: strengthImage },
    { id: 2, title: "Morning Yoga Flow", category: "Yoga", duration: "30 min", thumbnail: yogaImage },
    { id: 3, title: "HIIT Cardio Blast", category: "Cardio", duration: "25 min", thumbnail: cardioImage },
    { id: 4, title: "Upper Body Power", category: "Strength", duration: "40 min", thumbnail: strengthImage },
    { id: 5, title: "Flexibility & Stretching", category: "Yoga", duration: "20 min", thumbnail: yogaImage },
    { id: 6, title: "Advanced HIIT Circuit", category: "Cardio", duration: "35 min", thumbnail: cardioImage },
    { id: 7, title: "Core Strength Builder", category: "Strength", duration: "30 min", thumbnail: strengthImage },
    { id: 8, title: "Evening Relaxation Yoga", category: "Yoga", duration: "25 min", thumbnail: yogaImage },
    { id: 9, title: "Beginner Cardio Workout", category: "Cardio", duration: "20 min", thumbnail: cardioImage },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/client")}>
                <Dumbbell className="h-8 w-8 text-primary" />
                <span className="text-2xl font-display font-bold tracking-tight">FitPro</span>
              </div>
              <nav className="hidden md:flex items-center gap-6">
                <Button variant="ghost" onClick={() => setLocation("/client")} data-testid="link-dashboard">
                  Dashboard
                </Button>
                <Button variant="ghost" className="bg-accent" data-testid="link-workouts">
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
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="icon" data-testid="button-profile">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Workout Library</h1>
            <p className="text-muted-foreground mt-1">Access all your workout videos anytime</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="cursor-pointer hover-elevate"
                data-testid={`badge-filter-${category.toLowerCase()}`}
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                title={video.title}
                category={video.category}
                duration={video.duration}
                thumbnail={video.thumbnail}
                onPlay={() => console.log(`Playing: ${video.title}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
