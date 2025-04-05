import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  ArrowDown, 
  Pause, 
  PlayCircle, 
  Trash2, 
  XCircle,
  CheckCircle,
  AlertCircle,
  ArrowDownToLine,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type DownloadItem = {
  id: number;
  contentId: number;
  userId: number;
  downloadProgress: number;
  downloadStatus: 'in_progress' | 'complete' | 'error' | 'paused';
  size: number;
  downloadDate: string;
  quality: string;
  content?: {
    id: number;
    title: string;
    posterPath: string;
    releaseYear: number;
    type: string;
  };
};

const statusIcons = {
  in_progress: <ArrowDown className="h-4 w-4 text-blue-500" />,
  complete: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <AlertCircle className="h-4 w-4 text-red-500" />,
  paused: <Pause className="h-4 w-4 text-amber-500" />
};

const statusToText = {
  in_progress: 'Downloading',
  complete: 'Downloaded',
  error: 'Failed',
  paused: 'Paused'
};

export default function DownloadManager() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch downloads list
  const { data: downloads = [], isLoading } = useQuery<DownloadItem[]>({
    queryKey: ['/api/user/downloads'],
    enabled: isOpen, // Only fetch when the sheet is open
  });

  // Update download progress
  const updateMutation = useMutation({
    mutationFn: async ({ id, downloadProgress, downloadStatus }: { id: number; downloadProgress: number; downloadStatus: string }) => {
      const res = await apiRequest('PATCH', `/api/user/downloads/${id}`, { 
        downloadProgress, 
        downloadStatus 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/downloads'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update download status",
        variant: "destructive",
      });
    }
  });

  // Delete download
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/user/downloads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/downloads'] });
      toast({
        title: "Download removed",
        description: "The download has been removed from your library",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove download",
        variant: "destructive",
      });
    }
  });

  // Demo simulation of downloads in progress
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      // For each in_progress download, update the progress 
      downloads.forEach(download => {
        if (download.downloadStatus === 'in_progress' && download.downloadProgress < 100) {
          // Simulate download progress by increasing by 5-10%
          const increment = Math.floor(Math.random() * 5) + 5;
          const newProgress = Math.min(download.downloadProgress + increment, 100);
          
          updateMutation.mutate({ 
            id: download.id,
            downloadProgress: newProgress,
            downloadStatus: newProgress === 100 ? 'complete' : 'in_progress'
          });
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [downloads, isOpen, updateMutation]);

  // Group downloads by status
  const downloadsByStatus = downloads.reduce((acc, download) => {
    const status = download.downloadStatus;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(download);
    return acc;
  }, {} as Record<string, DownloadItem[]>);

  // Function to handle pausing a download
  const handlePause = (id: number) => {
    updateMutation.mutate({ id, downloadProgress: downloads.find(d => d.id === id)?.downloadProgress || 0, downloadStatus: 'paused' });
  };

  // Function to resume a download
  const handleResume = (id: number) => {
    updateMutation.mutate({ id, downloadProgress: downloads.find(d => d.id === id)?.downloadProgress || 0, downloadStatus: 'in_progress' });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={() => setIsOpen(true)}
        >
          <ArrowDownToLine className="h-5 w-5" />
          {downloads.some(d => d.downloadStatus === 'in_progress') && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">Downloads</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-6rem)] pr-4 mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center">
              <ArrowDownToLine className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No downloads</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You haven't downloaded any content yet
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/">Browse content</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* In Progress Downloads */}
              {downloadsByStatus.in_progress && downloadsByStatus.in_progress.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">In Progress</h3>
                  <div className="space-y-3">
                    {downloadsByStatus.in_progress.map((download) => (
                      <Card key={download.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="h-16 w-12 rounded overflow-hidden shrink-0">
                              <img 
                                src={download.content?.posterPath}
                                alt={download.content?.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="truncate">
                                  <h4 className="font-medium truncate">{download.content?.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {download.content?.type.charAt(0).toUpperCase() + download.content?.type.slice(1)} • {download.content?.releaseYear}
                                  </p>
                                </div>
                                <div className="flex">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handlePause(download.id)}
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteMutation.mutate(download.id)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Progress value={download.downloadProgress} className="h-1.5" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>{download.downloadProgress}%</span>
                                  <span>{formatFileSize(download.size)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Paused Downloads */}
              {downloadsByStatus.paused && downloadsByStatus.paused.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Paused</h3>
                  <div className="space-y-3">
                    {downloadsByStatus.paused.map((download) => (
                      <Card key={download.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="h-16 w-12 rounded overflow-hidden shrink-0">
                              <img 
                                src={download.content?.posterPath}
                                alt={download.content?.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="truncate">
                                  <h4 className="font-medium truncate">{download.content?.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {download.content?.type.charAt(0).toUpperCase() + download.content?.type.slice(1)} • {download.content?.releaseYear}
                                  </p>
                                </div>
                                <div className="flex">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleResume(download.id)}
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteMutation.mutate(download.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <Progress value={download.downloadProgress} className="h-1.5" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                  <span>{download.downloadProgress}%</span>
                                  <span>{formatFileSize(download.size)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Downloads */}
              {downloadsByStatus.complete && downloadsByStatus.complete.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Complete</h3>
                  <div className="space-y-3">
                    {downloadsByStatus.complete.map((download) => (
                      <Card key={download.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="h-16 w-12 rounded overflow-hidden shrink-0">
                              <img 
                                src={download.content?.posterPath}
                                alt={download.content?.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="truncate">
                                  <h4 className="font-medium truncate">{download.content?.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {download.content?.type.charAt(0).toUpperCase() + download.content?.type.slice(1)} • {download.content?.releaseYear}
                                  </p>
                                </div>
                                <div className="flex">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    asChild
                                  >
                                    <Link href={`/watch/${download.contentId}`}>
                                      <PlayCircle className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteMutation.mutate(download.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-500 font-medium">
                                  Ready to watch
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Downloads */}
              {downloadsByStatus.error && downloadsByStatus.error.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Failed</h3>
                  <div className="space-y-3">
                    {downloadsByStatus.error.map((download) => (
                      <Card key={download.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="h-16 w-12 rounded overflow-hidden shrink-0">
                              <img 
                                src={download.content?.posterPath}
                                alt={download.content?.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="truncate">
                                  <h4 className="font-medium truncate">{download.content?.title}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {download.content?.type.charAt(0).toUpperCase() + download.content?.type.slice(1)} • {download.content?.releaseYear}
                                  </p>
                                </div>
                                <div className="flex">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleResume(download.id)}
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteMutation.mutate(download.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 mt-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-500 font-medium">
                                  Download failed - Tap to retry
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}