import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import CategorySlider from '@/components/CategorySlider';
import ContentSection from '@/components/ContentSection';
import Footer from '@/components/Footer';

const Anime = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");

  // Define the interface for content objects
  interface AnimeContent {
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

  // Fetch all anime but limit display to avoid too many cards
  const { data: allAnime = [], isLoading } = useQuery<AnimeContent[]>({
    queryKey: ['/api/content', { type: 'anime' }],
  });
  
  // Limit to 15 items for better performance and user experience
  const anime = allAnime.slice(0, 15);

  // Filter anime by genre if needed
  const filteredAnime = selectedGenre === "All"
    ? anime
    : anime.filter((item: AnimeContent) => item.genres.includes(selectedGenre));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-6 px-4 md:px-6">
        <div className="container mx-auto">
          <motion.h1 
            className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Anime
          </motion.h1>
          <motion.p 
            className="text-muted-foreground max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Dive into the colorful world of anime with our extensive collection of series and movies. From shonen to slice of life, discover your next favorite anime.
          </motion.p>
        </div>
      </div>
      
      <CategorySlider 
        onSelectGenre={setSelectedGenre} 
        selectedGenre={selectedGenre} 
      />
      
      <ContentSection 
        title={`${selectedGenre === "All" ? "All" : selectedGenre} Anime`}
        items={filteredAnime}
        loading={isLoading}
      />
      
      <Footer />
    </div>
  );
};

export default Anime;
