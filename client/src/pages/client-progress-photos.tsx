import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Calendar,
  Weight,
  Trash2,
  TrendingDown,
  Image as ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ProgressPhoto {
  _id: string;
  photoUrl: string;
  description?: string;
  weight?: number;
  uploadedAt: string;
}

export default function ClientProgressPhotos() {
  const [, setLocation] = useLocation();
  const [clientId, setClientId] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const id = localStorage.getItem('clientId');
    if (!id) {
      setLocation('/client-access');
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: photos = [], isLoading } = useQuery<ProgressPhoto[]>({
    queryKey: ['/api/clients', clientId, 'progress-photos'],
    enabled: !!clientId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { photoUrl: string; description?: string; weight?: number }) => {
      return apiRequest('POST', `/api/clients/${clientId}/progress-photos`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'progress-photos'] });
      setUploadDialogOpen(false);
      setPhotoUrl("");
      setDescription("");
      setWeight("");
      toast({
        title: "Photo uploaded",
        description: "Your progress photo has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      return apiRequest('DELETE', `/api/progress-photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'progress-photos'] });
      toast({
        title: "Photo deleted",
        description: "Progress photo has been removed.",
      });
    },
  });

  const handleUpload = () => {
    if (!photoUrl.trim()) {
      toast({
        title: "Photo URL required",
        description: "Please enter a photo URL.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      photoUrl: photoUrl.trim(),
      description: description.trim() || undefined,
      weight: weight ? parseFloat(weight) : undefined,
    });
  };

  const handleDelete = (photoId: string) => {
    if (confirm("Are you sure you want to delete this progress photo?")) {
      deleteMutation.mutate(photoId);
    }
  };

  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const weightChange = (() => {
    const photosWithWeight = sortedPhotos.filter(p => p.weight);
    if (photosWithWeight.length < 2) return null;
    const latest = photosWithWeight[0].weight!;
    const earliest = photosWithWeight[photosWithWeight.length - 1].weight!;
    return latest - earliest;
  })();

  if (!clientId) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader currentPage="progress" />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight">Progress Photos</h1>
              <p className="text-muted-foreground mt-1">
                Track your transformation with before and after photos
              </p>
            </div>

            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-upload-photo">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Upload Progress Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photoUrl">Photo URL *</Label>
                    <Input
                      id="photoUrl"
                      placeholder="Enter photo URL..."
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      data-testid="input-photo-url"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your photo to an image hosting service and paste the URL here
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Current Weight (lbs)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 165.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      data-testid="input-weight"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Add notes about your progress, how you're feeling, etc."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      data-testid="textarea-description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                    data-testid="button-cancel-upload"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    data-testid="button-confirm-upload"
                  >
                    {uploadMutation.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Photos</p>
                    <p className="text-3xl font-bold font-display mt-1" data-testid="text-total-photos">
                      {photos.length}
                    </p>
                  </div>
                  <ImageIcon className="h-10 w-10 text-chart-1" />
                </div>
              </CardContent>
            </Card>

            {photos.length > 0 && photos[0].weight && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Latest Weight</p>
                      <p className="text-3xl font-bold font-display mt-1" data-testid="text-latest-weight">
                        {photos[0].weight} lbs
                      </p>
                    </div>
                    <Weight className="h-10 w-10 text-chart-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {weightChange !== null && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Weight Change</p>
                      <p className={`text-3xl font-bold font-display mt-1 ${weightChange < 0 ? 'text-chart-3' : 'text-chart-1'}`} data-testid="text-weight-change">
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
                      </p>
                    </div>
                    <TrendingDown className="h-10 w-10 text-chart-3" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading progress photos...
            </div>
          ) : sortedPhotos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPhotos.map((photo) => (
                <Card key={photo._id} className="overflow-hidden" data-testid={`card-photo-${photo._id}`}>
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={photo.photoUrl}
                      alt={photo.description || "Progress photo"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => handleDelete(photo._id)}
                      data-testid={`button-delete-${photo._id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(photo.uploadedAt), 'MMM dd, yyyy')}
                    </div>
                    {photo.weight && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Weight className="h-3 w-3" />
                          {photo.weight} lbs
                        </Badge>
                      </div>
                    )}
                    {photo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {photo.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">No progress photos yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Start documenting your fitness journey by uploading your first progress photo.
                    Track your transformation over time!
                  </p>
                </div>
                <Button onClick={() => setUploadDialogOpen(true)} data-testid="button-upload-first-photo">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Photo
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
