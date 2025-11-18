import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TrainerSidebar } from "@/components/trainer-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Video, Search, Clock } from "lucide-react";

export default function TrainerVideos() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: videos = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/videos'],
  });

  const filteredVideos = videos.filter(video => 
    video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <TrainerSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">
                Video Library
              </h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground">
                    Browse and manage training videos
                  </p>
                </div>
                <Badge className="bg-chart-1" data-testid="badge-total-videos">
                  {filteredVideos.length} Videos
                </Badge>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-md border bg-card">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos by title or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0"
                  data-testid="input-search-videos"
                />
              </div>

              {isLoading ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Loading videos...
                  </CardContent>
                </Card>
              ) : filteredVideos.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    {searchQuery ? 'No videos match your search' : 'No videos available'}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  {filteredVideos.map((video) => (
                    <Card key={video._id} data-testid={`card-video-${video._id}`}>
                      <CardHeader className="p-0">
                        <div className="aspect-video bg-muted rounded-t-md flex items-center justify-center">
                          {video.thumbnail ? (
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full h-full object-cover rounded-t-md"
                            />
                          ) : (
                            <Video className="h-12 w-12 opacity-50" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        <CardTitle className="font-display text-base line-clamp-1" data-testid="text-video-title">
                          {video.title}
                        </CardTitle>
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" data-testid="badge-category">
                            {video.category}
                          </Badge>
                          {video.duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {video.duration} min
                            </div>
                          )}
                        </div>
                        {video.difficulty && (
                          <Badge variant="secondary" data-testid="badge-difficulty">
                            {video.difficulty}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
