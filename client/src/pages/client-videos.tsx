import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ClientHeader } from "@/components/client-header";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Play,
  Clock,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import strengthImage from "@assets/generated_images/Strength_training_video_thumbnail_e7f2ebd6.png";
import yogaImage from "@assets/generated_images/Yoga_class_video_thumbnail_a8a89f8b.png";
import cardioImage from "@assets/generated_images/Cardio_workout_video_thumbnail_2c386154.png";

export default function ClientVideos() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIntensity, setSelectedIntensity] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedTrainer, setSelectedTrainer] = useState("All");

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: allVideos = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/videos'],
  });

  const { data: continueWatching = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', clientId, 'continue-watching'],
    enabled: !!clientId,
  });

  const { data: bookmarks = [] } = useQuery<any[]>({
    queryKey: ['/api/clients', clientId, 'bookmarks'],
    enabled: !!clientId,
  });

  const bookmarkMutation = useMutation({
    mutationFn: async ({ videoId, isBookmarked }: { videoId: string; isBookmarked: boolean }) => {
      if (isBookmarked) {
        return apiRequest('DELETE', `/api/clients/${clientId}/bookmarks/${videoId}`);
      } else {
        return apiRequest('POST', `/api/clients/${clientId}/bookmarks/${videoId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'bookmarks'] });
    },
  });

  const categories = useMemo(() => {
    const unique = new Set(allVideos.map(v => v.category));
    return ["All", ...Array.from(unique).sort()];
  }, [allVideos]);

  const intensities = ["All", "Low", "Medium", "High"];
  const durations = ["All", "0-15 min", "15-30 min", "30-45 min", "45+ min"];
  const trainers = useMemo(() => {
    const unique = new Set(allVideos.filter(v => v.trainer).map(v => v.trainer));
    return ["All", ...Array.from(unique).sort()];
  }, [allVideos]);

  const filteredVideos = useMemo(() => {
    return allVideos.filter(video => {
      const matchesSearch = !searchTerm || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || video.category === selectedCategory;
      const matchesIntensity = selectedIntensity === "All" || video.intensity === selectedIntensity;
      const matchesTrainer = selectedTrainer === "All" || video.trainer === selectedTrainer;
      
      const matchesDuration = (() => {
        if (selectedDuration === "All") return true;
        const duration = video.duration || 0;
        if (selectedDuration === "0-15 min") return duration <= 15;
        if (selectedDuration === "15-30 min") return duration > 15 && duration <= 30;
        if (selectedDuration === "30-45 min") return duration > 30 && duration <= 45;
        if (selectedDuration === "45+ min") return duration > 45;
        return true;
      })();

      return matchesSearch && matchesCategory && matchesIntensity && matchesDuration && matchesTrainer;
    });
  }, [allVideos, searchTerm, selectedCategory, selectedIntensity, selectedDuration, selectedTrainer]);

  const bookmarkedVideos = useMemo(() => {
    return bookmarks.map(b => b.video).filter(Boolean);
  }, [bookmarks]);

  const isVideoBookmarked = (videoId: string) => {
    return bookmarks.some(b => b.videoId === videoId);
  };

  const handleToggleBookmark = (videoId: string) => {
    const isBookmarked = isVideoBookmarked(videoId);
    bookmarkMutation.mutate({ videoId, isBookmarked });
  };

  const getThumbnail = (category: string) => {
    if (category === "Strength") return strengthImage;
    if (category === "Yoga") return yogaImage;
    return cardioImage;
  };

  const VideoCard = ({ video, showProgress = false, progress = 0 }: any) => {
    const isBookmarked = isVideoBookmarked(video._id);
    
    return (
      <Card className="overflow-hidden hover-elevate" data-testid={`card-video-${video._id}`}>
        <div className="relative aspect-video">
          <img
            src={getThumbnail(video.category)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button size="icon" className="h-12 w-12 rounded-full" data-testid={`button-play-${video._id}`}>
              <Play className="h-6 w-6" />
            </Button>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleBookmark(video._id);
            }}
            data-testid={`button-bookmark-${video._id}`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1" data-testid={`text-video-title-${video._id}`}>
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">{video.category}</Badge>
            {video.intensity && <Badge variant="outline">{video.intensity}</Badge>}
            {video.duration && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {video.duration} min
              </div>
            )}
          </div>
          {video.trainer && (
            <p className="text-sm text-muted-foreground mt-2">
              Trainer: {video.trainer}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!clientId) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="workouts" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Video Library</h1>
            <p className="text-muted-foreground mt-1">
              Access all your workout videos anytime
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all-videos">All Videos</TabsTrigger>
              <TabsTrigger value="continue" data-testid="tab-continue-watching">
                Continue Watching ({continueWatching.length})
              </TabsTrigger>
              <TabsTrigger value="bookmarks" data-testid="tab-bookmarks">
                Bookmarks ({bookmarkedVideos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-videos"
                  />
                </div>

                <div className="flex gap-3 flex-wrap items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[150px]" data-testid="select-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedIntensity} onValueChange={setSelectedIntensity}>
                    <SelectTrigger className="w-[150px]" data-testid="select-intensity">
                      <SelectValue placeholder="Intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      {intensities.map((intensity) => (
                        <SelectItem key={intensity} value={intensity}>
                          {intensity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger className="w-[150px]" data-testid="select-duration">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {trainers.length > 1 && (
                    <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                      <SelectTrigger className="w-[150px]" data-testid="select-trainer">
                        <SelectValue placeholder="Trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer} value={trainer}>
                            {trainer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {(searchTerm || selectedCategory !== "All" || selectedIntensity !== "All" || 
                    selectedDuration !== "All" || selectedTrainer !== "All") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All");
                        setSelectedIntensity("All");
                        setSelectedDuration("All");
                        setSelectedTrainer("All");
                      }}
                      data-testid="button-clear-filters"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  Showing {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    Loading workout videos...
                  </div>
                ) : filteredVideos.length > 0 ? (
                  filteredVideos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No videos found matching your filters
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="continue" className="space-y-6">
              {continueWatching.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {continueWatching.map((item: any) => (
                    <VideoCard
                      key={item.video._id}
                      video={item.video}
                      showProgress
                      progress={item.progressPercent}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12">
                  <div className="text-center space-y-2">
                    <Play className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">No videos in progress</h3>
                    <p className="text-sm text-muted-foreground">
                      Start watching a video and it will appear here
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              {bookmarkedVideos.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedVideos.map((video: any) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
                </div>
              ) : (
                <Card className="p-12">
                  <div className="text-center space-y-2">
                    <Bookmark className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="font-semibold">No bookmarked videos</h3>
                    <p className="text-sm text-muted-foreground">
                      Bookmark your favorite videos for quick access
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
