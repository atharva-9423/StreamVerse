import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';
import LazyImage from './LazyImage';
import { getQueryFn } from '@/lib/queryClient';
import { formatTime } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, Clock, Info, CalendarDays } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import PageTransition from './PageTransition';

interface Episode {
  id: number;
  animeId: number;
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnail: string;
  duration: number;
  overview: string;
  releaseDate: string;
  videoUrl: string | null;
}

interface Anime {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  rating: string;
  type: string;
}

interface EpisodesResponse {
  anime: Anime;
  episodes: Episode[];
  seasonCount: number;
}

interface EpisodesListProps {
  animeId: number;
  showTitle?: boolean;
  maxEpisodes?: number;
  defaultSeason?: number;
}

export default function EpisodesList({ 
  animeId, 
  showTitle = true,
  maxEpisodes = 0,
  defaultSeason = 1
}: EpisodesListProps) {
  const [selectedSeason, setSelectedSeason] = useState<number>(defaultSeason);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data, isLoading, error } = useQuery<EpisodesResponse>({
    queryKey: ['/api/episodes', animeId],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 30 * 1000,
    // Pass the animeId as a query parameter to the /api/episodes endpoint
    meta: {
      url: `/api/episodes?animeId=${animeId}`
    }
  });

  useEffect(() => {
    // If data loads and the selected season doesn't exist, set to season 1
    if (data && selectedSeason > data.seasonCount) {
      setSelectedSeason(1);
    }
  }, [data, selectedSeason]);

  const handleWatchEpisode = (episodeId: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/watch/${animeId}/${episodeId}`);
  };

  // Filter episodes by the selected season
  const seasonEpisodes = data?.episodes
    .filter(episode => episode.seasonNumber === selectedSeason)
    .sort((a, b) => a.episodeNumber - b.episodeNumber) || [];

  // Limit the number of episodes shown if maxEpisodes is set
  const displayEpisodes = maxEpisodes > 0 
    ? seasonEpisodes.slice(0, maxEpisodes) 
    : seasonEpisodes;

  // Generate tabs for each season
  const seasonTabs = Array.from({ length: data?.seasonCount || 1 }, (_, i) => i + 1);

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading episodes: {(error as Error).message}</div>;
  }

  if (!data || data.episodes.length === 0) {
    return <div className="text-muted-foreground">No episodes available for this anime.</div>;
  }

  return (
    <PageTransition className="w-full" variant="fade">
      <div className="space-y-4">
        {showTitle && (
          <h2 className="text-2xl font-bold tracking-tight">{data.anime.title} - Episodes</h2>
        )}
        
        {data.seasonCount > 1 && (
          <Tabs 
            defaultValue={selectedSeason.toString()} 
            onValueChange={val => setSelectedSeason(parseInt(val))}
            className="w-full"
          >
            <TabsList className="mb-4 flex overflow-x-auto pb-2 scrollbar-hide">
              {seasonTabs.map((season) => (
                <TabsTrigger 
                  key={season} 
                  value={season.toString()}
                  className="min-w-[80px]"
                >
                  Season {season}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {displayEpisodes.map((episode) => (
              <div 
                key={episode.id} 
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleWatchEpisode(episode.id)}
              >
                <div className="relative sm:w-56 h-32 flex-shrink-0 rounded-md overflow-hidden">
                  <LazyImage
                    src={episode.thumbnail}
                    alt={`Episode ${episode.episodeNumber} thumbnail`}
                    className="w-full h-full object-cover"
                    fallbackSrc="https://via.placeholder.com/300x200?text=Episode+Thumbnail"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded px-2 py-1">
                    {formatTime(episode.duration)}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">
                      {selectedSeason > 1 ? `S${selectedSeason}:` : ''}E{episode.episodeNumber} - {episode.title}
                    </h3>
                    {!isMobile && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 w-4 h-4" />
                        {formatTime(episode.duration)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-2">
                    <CalendarDays className="mr-1 w-3 h-3" />
                    <span>{new Date(episode.releaseDate).toLocaleDateString()}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {episode.overview}
                  </p>
                </div>
              </div>
            ))}

            {maxEpisodes > 0 && seasonEpisodes.length > maxEpisodes && (
              <div className="pt-2 pb-4 flex justify-center">
                <Link 
                  to={`/anime/${animeId}/episodes`}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  <Info className="w-4 h-4 mr-2" />
                  View All Episodes
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </PageTransition>
  );
}