import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import EpisodesList from '@/components/EpisodesList';
import BackButton from '@/components/BackButton';
import { Skeleton } from '@/components/ui/skeleton';
import LazyImage from '@/components/LazyImage';
import PageTransition from '@/components/PageTransition';
import { MoodBadge } from '@/components/MoodLighting';

interface Anime {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: number;
  rating: string;
  type: string;
  genres?: string[];
}

export default function EpisodesPage() {
  const { animeId } = useParams();
  const id = parseInt(animeId || '0');

  // Fetch the anime details
  const { data: anime, isLoading: isLoadingAnime } = useQuery<Anime>({
    queryKey: ['/api/content', id],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: Boolean(id)
  });

  if (!id) {
    return (
      <PageTransition variant="fade">
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Invalid Anime ID</h1>
          <BackButton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="fade">
      <div className="container py-8">
        <BackButton className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Sidebar with anime info */}
          <div className="space-y-6">
            {isLoadingAnime ? (
              <Skeleton className="h-[450px] w-full rounded-lg" />
            ) : anime ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden">
                  <LazyImage
                    src={anime.posterPath}
                    alt={anime.title}
                    className="w-full h-auto object-cover"
                    fallbackSrc="https://via.placeholder.com/300x450?text=Anime+Poster"
                  />
                </div>
                
                <h1 className="text-2xl font-bold">{anime.title}</h1>
                
                <div className="flex flex-wrap gap-2">
                  {anime.genres?.map(genre => (
                    <MoodBadge key={genre} genres={[genre]}>
                      {genre}
                    </MoodBadge>
                  ))}
                </div>
                
                <div className="text-sm">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Year</span>
                    <span>{anime.releaseYear}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Rating</span>
                    <span>{anime.rating}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">{anime.type}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">{anime.overview}</p>
              </div>
            ) : (
              <div className="text-red-500">Failed to load anime details</div>
            )}
          </div>

          {/* Episodes list */}
          <div>
            <EpisodesList 
              animeId={id} 
              showTitle={false}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}