import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategorySlider from '@/components/CategorySlider';
import ContentSection from '@/components/ContentSection';
import FeaturedContent from '@/components/FeaturedContent';
import ContinueWatching from '@/components/ContinueWatching';
import Footer from '@/components/Footer';
import { HeroSkeleton, ContentSectionSkeleton } from '@/components/ui/skeleton';

// Define content type for proper typing
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
  matchPercentage?: number;
}

const Home = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Fetch featured content for hero section
  const { data: featuredContent = [], isLoading: featuredLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/featured'],
  });

  // Fetch trending content - limit to 10 items in the UI
  const { data: trendingContentFull = [], isLoading: trendingLoading } = useQuery<Content[]>({
    queryKey: ['/api/content/trending'],
  });
  const trendingContent = trendingContentFull.slice(0, 10);

  // Fetch anime content - limit to 10 items in the UI
  const { data: animeContentFull = [], isLoading: animeLoading } = useQuery<Content[]>({
    queryKey: ['/api/content', { type: 'anime' }],
  });
  const animeContent = animeContentFull.slice(0, 10);
  
  // Fetch another set of anime content for second section - limit to 5 items in the UI
  const { data: recentAnimeContentFull = [], isLoading: recentAnimeLoading } = useQuery<Content[]>({
    queryKey: ['/api/content', { type: 'anime', sort: 'recent' }],
  });
  const recentAnimeContent = recentAnimeContentFull.slice(0, 5);

  // Filter content by genre if needed
  const filteredContent = selectedGenre === "All"
    ? trendingContent
    : trendingContent.filter((item: Content) => 
        item.genres && item.genres.includes(selectedGenre)
      );

  // Choose first featured content for hero if available
  const heroContent = featuredContent && featuredContent.length > 0 
    ? featuredContent[0] as Content 
    : null;
  
  // Choose second featured content for parallax section if available
  const featuredParallax = featuredContent && featuredContent.length > 1 
    ? featuredContent[1] as Content 
    : null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {featuredLoading ? (
        <HeroSkeleton />
      ) : heroContent && (
        <HeroSection content={heroContent} />
      )}
      
      <CategorySlider 
        onSelectGenre={setSelectedGenre} 
        selectedGenre={selectedGenre} 
      />
      
      <ContinueWatching />
      
      {trendingLoading ? (
        <div className="container mx-auto px-4 py-8">
          <ContentSectionSkeleton />
        </div>
      ) : (
        <ContentSection 
          title="Trending Now" 
          items={filteredContent}
          loading={false}
        />
      )}
      
      {!featuredLoading && featuredParallax && (
        <FeaturedContent content={featuredParallax} />
      )}
      
      {animeLoading ? (
        <div className="container mx-auto px-4 py-8">
          <ContentSectionSkeleton />
        </div>
      ) : (
        <ContentSection 
          title="Popular in Anime" 
          items={animeContent}
          loading={false}
        />
      )}
      
      {recentAnimeLoading ? (
        <div className="container mx-auto px-4 py-8">
          <ContentSectionSkeleton />
        </div>
      ) : (
        <ContentSection 
          title="Recently Added Anime" 
          items={recentAnimeContent}
          loading={false}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Home;
