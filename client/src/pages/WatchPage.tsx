import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Settings,
  ListVideo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/utils';
import { apiRequest, getQueryFn } from '@/lib/queryClient';
import Navbar from '@/components/Navbar';
import { Movie } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

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

interface EpisodesResponse {
  anime: {
    id: number;
    title: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    releaseYear: number;
    rating: string;
    type: string;
  };
  episodes: Episode[];
  seasonCount: number;
}

const WatchPage = () => {
  const { id, animeId, episodeId } = useParams();
  const contentId = animeId || id;
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

  // Fetch content details (movie or anime)
  const { data: content, isLoading: isLoadingContent } = useQuery<Movie>({
    queryKey: [`/api/content/${contentId}`],
  });

  // Fetch episodes if this is an anime episode
  const { data: episodesData, isLoading: isLoadingEpisodes } = useQuery<EpisodesResponse>({
    queryKey: ['/api/episodes', parseInt(animeId || '0')],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!animeId && content?.type === 'anime',
  });

  // Get episode details if watching a specific episode
  useEffect(() => {
    if (episodesData && episodeId) {
      const episode = episodesData.episodes.find(
        ep => ep.id === parseInt(episodeId)
      );
      if (episode) {
        setCurrentEpisode(episode);
      }
    }
  }, [episodesData, episodeId]);

  const isLoading = isLoadingContent || (!!animeId && isLoadingEpisodes);

  useEffect(() => {
    // Reset controls hide timeout on mouse move
    const handleMouseMove = () => {
      setShowControls(true);
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    // Add event listeners
    const videoContainer = videoContainerRef.current;
    if (videoContainer) {
      videoContainer.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (videoContainer) {
        videoContainer.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    // Update watch history every 5 seconds while playing
    let interval: NodeJS.Timeout | null = null;
    
    if (isPlaying && videoRef.current) {
      interval = setInterval(async () => {
        await updateWatchHistory();
      }, 5000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentTime, duration]);

  const { user } = useAuth();
  
  const updateWatchHistory = async () => {
    if (!videoRef.current || !content || !user) return;
    
    try {
      const watchedTime = Math.floor(videoRef.current.currentTime);
      const totalTime = Math.floor(videoRef.current.duration);
      const percentComplete = Math.floor((watchedTime / totalTime) * 100);
      
      // Use contentId to track the main anime/movie, but also include episode data if available
      await apiRequest('POST', '/api/user/history', {
        userId: user.id,
        contentId: parseInt(contentId || '0'),
        watchedTime,
        totalTime,
        percentComplete,
        episode: currentEpisode ? `E${currentEpisode.episodeNumber}` : undefined,
        season: currentEpisode ? `S${currentEpisode.seasonNumber}` : undefined
      });
      
      // Invalidate watch history cache
      queryClient.invalidateQueries({
        queryKey: ['/api/user/history'],
      });
    } catch (error) {
      console.error('Failed to update watch history:', error);
    }
  };
  
  // Navigate to previous or next episode
  const navigateToEpisode = (direction: 'prev' | 'next') => {
    if (!episodesData || !currentEpisode || !animeId) return;
    
    // First sort episodes by season and episode number
    const sortedEpisodes = [...episodesData.episodes].sort((a, b) => {
      if (a.seasonNumber !== b.seasonNumber) {
        return a.seasonNumber - b.seasonNumber;
      }
      return a.episodeNumber - b.episodeNumber;
    });
    
    // Find current index
    const currentIndex = sortedEpisodes.findIndex(ep => ep.id === currentEpisode.id);
    if (currentIndex === -1) return;
    
    // Calculate target index based on direction
    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    // Check if target index is valid
    if (targetIndex >= 0 && targetIndex < sortedEpisodes.length) {
      const targetEpisode = sortedEpisodes[targetIndex];
      window.location.href = `/watch/${animeId}/${targetEpisode.id}`;
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div 
        ref={videoContainerRef}
        className="relative w-full h-screen flex items-center justify-center"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onDurationChange={handleDurationChange}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={togglePlay}
              poster={content?.backdropPath ? content.backdropPath : undefined}
            >
              {currentEpisode && currentEpisode.videoUrl ? (
                // Use episode-specific video URL if available
                <source src={currentEpisode.videoUrl} type="video/mp4" />
              ) : content?.genres && content.genres.length > 0 ? (
                // Fallback to genre-based videos
                content.genres.includes('Action') ? (
                  <source src="/videos/action_video.mp4" type="video/mp4" />
                ) : content.genres.includes('Anime') ? (
                  <source src="/videos/anime_video.mp4" type="video/mp4" />
                ) : content.genres.includes('Sci-Fi') ? (
                  <source src="/videos/sci_fi_video.mp4" type="video/mp4" />
                ) : (
                  <source src="/videos/adventure_video.mp4" type="video/mp4" />
                )
              ) : (
                // Default video if no genres
                <source src="/videos/anime_video.mp4" type="video/mp4" />
              )}
              Your browser does not support the video tag.
            </video>
            
            {/* Video Controls */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/70 flex flex-col justify-between p-4 transition-opacity"
              initial={{ opacity: 1 }}
              animate={{ opacity: showControls ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Top Bar */}
              <div className="flex justify-between items-center">
                <Link href={animeId ? `/anime/${animeId}/episodes` : "/"}>
                  <Button variant="ghost" className="text-foreground">
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                </Link>
                <div className="text-foreground font-heading text-lg font-medium flex items-center">
                  {content?.title}
                  {currentEpisode && (
                    <span className="ml-2 text-sm opacity-80">
                      • S{currentEpisode.seasonNumber} E{currentEpisode.episodeNumber} - {currentEpisode.title}
                    </span>
                  )}
                </div>
                {animeId && (
                  <Link href={`/anime/${animeId}/episodes`}>
                    <Button variant="ghost" className="text-foreground">
                      <ListVideo className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
              
              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <Button 
                    size="lg" 
                    variant="default" 
                    className="h-20 w-20 rounded-full p-0 bg-primary/90 hover:bg-primary"
                    onClick={togglePlay}
                  >
                    <Play className="h-10 w-10 text-primary-foreground" />
                  </Button>
                </div>
              )}
              
              {/* Bottom Controls */}
              <div className="space-y-4">
                {/* Progress Bar */}
                <Slider
                  className="cursor-pointer"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={[currentTime]}
                  onValueChange={handleProgressChange}
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                      {isPlaying ? (
                        <Pause className="h-5 w-5 text-foreground" />
                      ) : (
                        <Play className="h-5 w-5 text-foreground" />
                      )}
                    </Button>
                    
                    {currentEpisode && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateToEpisode('prev')}
                        disabled={!episodesData || episodesData.episodes.findIndex(ep => ep.id === currentEpisode.id) <= 0}
                      >
                        <SkipBack className="h-5 w-5 text-foreground" />
                      </Button>
                    )}
                    
                    {currentEpisode && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => navigateToEpisode('next')}
                        disabled={!episodesData || episodesData.episodes.findIndex(ep => ep.id === currentEpisode.id) >= episodesData.episodes.length - 1}
                      >
                        <SkipForward className="h-5 w-5 text-foreground" />
                      </Button>
                    )}
                    
                    <span className="text-foreground text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="hidden md:flex items-center space-x-2">
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? (
                          <VolumeX className="h-5 w-5 text-foreground" />
                        ) : (
                          <Volume2 className="h-5 w-5 text-foreground" />
                        )}
                      </Button>
                      
                      <Slider
                        className="w-24 cursor-pointer"
                        min={0}
                        max={1}
                        step={0.01}
                        value={[isMuted ? 0 : volume]}
                        onValueChange={handleVolumeChange}
                      />
                    </div>
                    
                    <Button variant="ghost" size="icon" onClick={handleFullscreen}>
                      <Maximize className="h-5 w-5 text-foreground" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
