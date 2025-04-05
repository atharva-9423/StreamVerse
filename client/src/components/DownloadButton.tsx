import { useState } from 'react';
import { ArrowDownToLine, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DownloadButtonProps {
  contentId: number;
  title: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function DownloadButton({
  contentId,
  title,
  className = '',
  variant = 'outline',
  size = 'default'
}: DownloadButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);
  const { toast } = useToast();
  
  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async () => {
      // Generate a random file size between 500MB and 2GB
      const fileSize = Math.floor(Math.random() * (2000 - 500 + 1) + 500) * 1024 * 1024;
      
      const res = await apiRequest('POST', '/api/user/downloads', {
        contentId,
        size: fileSize,
        quality: 'high',
        downloadStatus: 'in_progress',
        downloadProgress: 0,
      });
      return res.json();
    },
    onSuccess: () => {
      setDownloadStarted(true);
      queryClient.invalidateQueries({ queryKey: ['/api/user/downloads'] });
      
      setTimeout(() => {
        setDialogOpen(false);
        setDownloadStarted(false);
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message || "Could not start download. Try again later.",
        variant: "destructive",
      });
    }
  });

  const handleDownload = () => {
    downloadMutation.mutate();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={className}
        >
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download "{title}"</DialogTitle>
          <DialogDescription>
            This content will be downloaded to your device and will be available for offline viewing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Download quality:</span>
              <span className="font-medium">High (1080p)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audio:</span>
              <span className="font-medium">English (5.1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtitles:</span>
              <span className="font-medium">English</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated size:</span>
              <span className="font-medium">~1.2 GB</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setDialogOpen(false)}
            disabled={downloadMutation.isPending || downloadStarted}
          >
            Cancel
          </Button>
          {downloadStarted ? (
            <Button disabled>
              <Check className="mr-2 h-4 w-4" />
              Download started
            </Button>
          ) : (
            <Button 
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
            >
              {downloadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Start Download
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}