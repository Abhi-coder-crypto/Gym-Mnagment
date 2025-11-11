import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadVideoModal } from "@/components/upload-video-modal";
import { Search, Plus } from "lucide-react";
import { VideoCard } from "@/components/video-card";
import strengthImage from "@assets/generated_images/Strength_training_video_thumbnail_e7f2ebd6.png";
import yogaImage from "@assets/generated_images/Yoga_class_video_thumbnail_a8a89f8b.png";
import cardioImage from "@assets/generated_images/Cardio_workout_video_thumbnail_2c386154.png";
import { useState } from "react";

export default function AdminVideos() {
  const style = { "--sidebar-width": "16rem" };
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const videos = [
    { id: 1, title: "Full Body Strength Training", category: "Strength", duration: "45 min", thumbnail: strengthImage, views: 1243 },
    { id: 2, title: "Morning Yoga Flow", category: "Yoga", duration: "30 min", thumbnail: yogaImage, views: 892 },
    { id: 3, title: "HIIT Cardio Blast", category: "Cardio", duration: "25 min", thumbnail: cardioImage, views: 2156 },
    { id: 4, title: "Upper Body Power", category: "Strength", duration: "40 min", thumbnail: strengthImage, views: 1567 },
    { id: 5, title: "Flexibility & Stretching", category: "Yoga", duration: "20 min", thumbnail: yogaImage, views: 743 },
    { id: 6, title: "Advanced HIIT Circuit", category: "Cardio", duration: "35 min", thumbnail: cardioImage, views: 1890 },
    { id: 7, title: "Core Strength Builder", category: "Strength", duration: "30 min", thumbnail: strengthImage, views: 1432 },
    { id: 8, title: "Evening Relaxation Yoga", category: "Yoga", duration: "25 min", thumbnail: yogaImage, views: 654 },
    { id: 9, title: "Beginner Cardio Workout", category: "Cardio", duration: "20 min", thumbnail: cardioImage, views: 2341 },
  ];

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Video Library</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-videos"
                  />
                </div>
                <Button onClick={() => setShowUploadModal(true)} data-testid="button-upload-video">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </div>

              <p className="text-muted-foreground">{filteredVideos.length} videos in library</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
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
      </div>

      <UploadVideoModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
      />
    </SidebarProvider>
  );
}
