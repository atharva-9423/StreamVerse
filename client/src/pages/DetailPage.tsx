import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Play,
  Plus,
  Check,
  Star,
  CalendarDays,
  Clock,
  Download,
  Film,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentSection from '@/components/ContentSection';
import ShareButton from '@/components/ShareButton';
import DownloadButton from '@/components/DownloadButton';
import LazyImage from '@/components/LazyImage';
import EpisodesList from '@/components/EpisodesList';
import { getPlaceholderImage } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton, ContentSectionSkeleton } from '@/components/ui/skeleton';
import MoodLighting, { MoodText, MoodBadge, MoodAccent } from '@/components/MoodLighting';

interface Content {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  rating: string;
  type: string;
  genres: string[];
  matchPercentage: number;
}

const DetailPage = () => {
  const { id } = useParams();
  const [inWatchlist, setInWatchlist] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const y = useTransform(scrollY, [0, 300], [0, 100]); // Parallax effect

  // Fetch content details
  const { data: content, isLoading } = useQuery<Content>({
    queryKey: [`/api/content/${id}`],
  });

  // Fetch similar content based on genre
  const { data: similarContent = [] } = useQuery<Content[]>({
    queryKey: ['/api/content', { genre: content?.genres?.[0] || '' }],
    enabled: !!content?.genres?.length,
  });

  // TypeScript type assertion for content
  const typedContent = content as Content;
  const typedSimilarContent = similarContent as Content[];

  // Filter out the current content from similar content
  const filteredSimilarContent = typedSimilarContent.filter((item: Content) => item.id !== parseInt(id || '0'));

  // Handle toast description with content title
  const getToastDescription = () => {
    if (!typedContent) return '';
    return `${typedContent.title} has been ${inWatchlist ? 'removed from' : 'added to'} your watchlist.`;
  };

  // Check if this content is in the user's watchlist
  useEffect(() => {
    if (user && user.watchlist && id) {
      const contentIdNum = parseInt(id);
      // TypeScript: We cast both to strings to allow comparison
      setInWatchlist(user.watchlist.some(item => String(item) === String(contentIdNum)));
    }
  }, [user, id]);

  const handleWatchlist = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to add content to your watchlist',
        variant: 'destructive',
      });
      return;
    }

    try {
      await apiRequest('POST', '/api/user/watchlist', {
        contentId: parseInt(id || '0'),
        add: !inWatchlist
      });
      
      setInWatchlist(!inWatchlist);
      
      toast({
        title: inWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
        description: getToastDescription(),
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update watchlist',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
            <Skeleton className="w-full h-full" variant="banner" animated />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 -mt-40 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Poster skeleton */}
            <div className="md:col-start-1 md:row-start-1">
              <Skeleton className="aspect-[2/3] rounded-lg shadow-xl" animated />
            </div>
            
            {/* Content Details skeleton */}
            <div className="md:col-span-2 md:col-start-2 md:row-start-1 space-y-4">
              <Skeleton className="h-10 w-2/3" animated /> {/* Title */}
              
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Skeleton className="h-6 w-24" animated /> {/* Badge */}
                <Skeleton className="h-6 w-16" animated /> {/* Badge */}
                <Skeleton className="h-6 w-16" animated /> {/* Badge */}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-5">
                <Skeleton className="h-6 w-20" animated /> {/* Genre */}
                <Skeleton className="h-6 w-24" animated /> {/* Genre */}
                <Skeleton className="h-6 w-16" animated /> {/* Genre */}
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" animated /> {/* Overview */}
                <Skeleton className="h-4 w-full" animated /> {/* Overview */}
                <Skeleton className="h-4 w-full" animated /> {/* Overview */}
                <Skeleton className="h-4 w-3/4" animated /> {/* Overview */}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8 pt-4">
                <Skeleton className="h-10 w-32" animated /> {/* Button */}
                <Skeleton className="h-10 w-32" animated /> {/* Button */}
                <Skeleton className="h-10 w-10" animated /> {/* Icon Button */}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Skeleton className="h-16 w-full" animated /> {/* Info box */}
                <Skeleton className="h-16 w-full" animated /> {/* Info box */}
                <Skeleton className="h-16 w-full" animated /> {/* Info box */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Content skeleton */}
        <div className="mt-12">
          <ContentSectionSkeleton />
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-heading font-bold">Content not found</h1>
          <p className="text-muted-foreground mt-4">The content you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button className="mt-6">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero background with parallax and mood lighting */}
      <MoodLighting 
        genres={content.genres} 
        variant="atmospheric" 
        className="relative h-[70vh] overflow-hidden"
      >
        <motion.div 
          ref={headerRef}
          className="relative h-full w-full"
        >
          <motion.div 
            className="absolute inset-0"
            style={{ 
              opacity,
              y
            }}
          >
            <LazyImage 
              src={content.backdropPath}
              alt={`${content.title} backdrop`}
              className="w-full h-full object-cover"
              fallbackSrc={getPlaceholderImage('backdrop', content.title)}
              skeletonClassName="absolute inset-0"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </motion.div>
      </MoodLighting>
      
      <div className="container mx-auto px-4 md:px-6 -mt-40 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster with mood lighting */}
          <div className="md:col-start-1 md:row-start-1">
            <MoodLighting genres={content.genres} variant="neon-border">
              <motion.div 
                className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <LazyImage 
                  src={content.posterPath} 
                  alt={content.title} 
                  className="w-full h-full object-cover"
                  fallbackSrc={getPlaceholderImage('poster', content.title)}
                  aspectRatio="2/3"
                />
              </motion.div>
            </MoodLighting>
          </div>
          
          {/* Content Details with mood lighting */}
          <div className="md:col-span-2 md:col-start-2 md:row-start-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MoodText genres={content.genres} as="h1" className="font-heading font-bold text-3xl md:text-5xl mb-3">
                {content.title}
              </MoodText>
              
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <MoodBadge genres={content.genres} className="text-sm font-semibold">
                  {content.matchPercentage}% Match
                </MoodBadge>
                <Badge variant="outline" className="text-muted-foreground">
                  {content.releaseYear}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {content.rating}
                </Badge>
                {content.type === 'anime' && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Anime
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-5">
                {content.genres.map((genre: string) => (
                  <MoodBadge key={genre} genres={[genre]} className="text-xs">
                    {genre}
                  </MoodBadge>
                ))}
              </div>
              
              <p className="text-foreground mb-8 text-lg leading-relaxed">
                {content.overview}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <MoodLighting genres={content.genres} variant="interactive">
                  <Link href={`/watch/${content.id}`}>
                    <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Play className="h-4 w-4" /> Watch Now
                    </Button>
                  </Link>
                </MoodLighting>
                
                <MoodLighting genres={content.genres} variant="interactive" intensity={0.6}>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={handleWatchlist}
                  >
                    {inWatchlist ? (
                      <>
                        <Check className="h-4 w-4" /> In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add to Watchlist
                      </>
                    )}
                  </Button>
                </MoodLighting>
                
                <MoodLighting genres={content.genres} variant="interactive" intensity={0.5}>
                  <ShareButton 
                    title={content.title}
                    contentId={content.id}
                    description={content.overview}
                    imageUrl={content.posterPath}
                    variant="outline"
                    size="icon"
                    showLabel={false}
                  />
                </MoodLighting>
                
                {user && (
                  <MoodLighting genres={content.genres} variant="interactive" intensity={0.5}>
                    <DownloadButton
                      contentId={content.id}
                      title={content.title}
                      variant="outline"
                    />
                  </MoodLighting>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <MoodLighting genres={content.genres} className="p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5" style={{ color: 'var(--mood-primary)' }} />
                    <div>
                      <div className="text-lg font-medium">{content.matchPercentage / 10}/10</div>
                      <div className="text-sm text-muted-foreground">User Rating</div>
                    </div>
                  </div>
                </MoodLighting>
                
                <MoodLighting genres={content.genres} className="p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" style={{ color: 'var(--mood-primary)' }} />
                    <div>
                      <div className="text-lg font-medium">{content.releaseYear}</div>
                      <div className="text-sm text-muted-foreground">Release Year</div>
                    </div>
                  </div>
                </MoodLighting>
                
                <MoodLighting genres={content.genres} className="p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" style={{ color: 'var(--mood-primary)' }} />
                    <div>
                      <div className="text-lg font-medium">{content.type === 'anime' ? '24 min/ep' : '129 min'}</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                  </div>
                </MoodLighting>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Episodes section for anime content */}
      {content.type === 'anime' && (
        <div className="mt-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <MoodAccent genres={content.genres} as="h2" className="text-2xl font-heading font-bold">
                <div className="flex items-center">
                  <Film className="mr-2 h-6 w-6" />
                  Episodes
                </div>
              </MoodAccent>
              
              <Link href={`/anime/${content.id}/episodes`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  View All Episodes
                </Button>
              </Link>
            </div>
            
            <EpisodesList 
              animeId={content.id} 
              showTitle={false}
              maxEpisodes={5}
            />
          </div>
        </div>
      )}
      
      {/* Similar Content with mood lighting title */}
      {filteredSimilarContent.length > 0 && (
        <div className="mt-12">
          <div className="container mx-auto px-4">
            <MoodAccent genres={content.genres} as="h2" className="text-2xl font-heading font-bold mb-6">
              You May Also Like
            </MoodAccent>
          </div>
          <ContentSection 
            title="" 
            items={filteredSimilarContent} 
          />
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default DetailPage;
