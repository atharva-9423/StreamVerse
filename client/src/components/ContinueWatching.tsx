import { useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { Play, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatRemainingTime } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const ContinueWatching = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { toast } = useToast();

  const { data: continueWatching = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/user/continue-watching'],
  });
  
  // Mark as watched mutation
  const markAsWatchedMutation = useMutation({
    mutationFn: async (contentId: number) => {
      const res = await apiRequest('POST', '/api/user/history/complete', { contentId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/continue-watching'] });
      toast({
        title: "Marked as watched",
        description: "Content has been marked as completed.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark content as watched.",
        variant: "destructive",
      });
    }
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (isLoading) {
    return (
      <section className="py-8 px-4 md:px-6" ref={ref}>
        <div className="container mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-6">
            Continue Watching
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="bg-muted animate-pulse h-64"></Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!continueWatching.length) {
    return null;
  }

  return (
    <section className="py-8 px-4 md:px-6" ref={ref}>
      <div className="container mx-auto">
        <motion.h2
          className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          Continue Watching
        </motion.h2>
        
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {continueWatching.map((item: any) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className="content-card group relative bg-card rounded-md overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={item.content?.posterPath} 
                    alt={item.content?.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href={`/watch/${item.contentId}`}>
                      <Button size="lg" variant="default" className="h-14 w-14 rounded-full p-0 bg-primary/90 hover:bg-primary">
                        <Play className="h-6 w-6 text-primary-foreground" />
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground text-lg">
                        {item.content?.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {item.season && item.episode 
                          ? `S${item.season}:E${item.episode}` 
                          : formatRemainingTime(item.totalTime - item.watchedTime)
                        }
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => markAsWatchedMutation.mutate(item.contentId)}
                          disabled={markAsWatchedMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark as watched
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Add to watchlist
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3">
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${item.percentComplete}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-muted-foreground text-xs">
                        {formatRemainingTime(item.totalTime - item.watchedTime)} remaining
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {item.percentComplete}% complete
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ContinueWatching;
