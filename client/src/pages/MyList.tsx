import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ContentCard';
import { useQuery } from '@tanstack/react-query';
import { Movie } from '@shared/schema';
import { Loader2 } from 'lucide-react';

const MyList = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch the user's watchlist
  const { data, isLoading, error } = useQuery<Movie[]>({
    queryKey: ['/api/user/watchlist'],
    enabled: isClient,
  });
  
  // Safe access to watchlist data with default empty array
  const watchlist = data || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground">My List</h1>
          <p className="text-muted-foreground mt-2">Your saved movies and anime series</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-muted rounded-lg">
            <p className="text-foreground">Failed to load your watchlist. Please try again later.</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-8 text-center bg-muted rounded-lg">
            <h3 className="font-heading font-semibold text-xl mb-2">Your list is empty</h3>
            <p className="text-muted-foreground">Add movies and anime to your list by clicking the "+" button when browsing content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {watchlist.map((item) => (
              <ContentCard 
                key={item.id}
                id={item.id}
                title={item.title}
                posterPath={item.posterPath}
                releaseYear={item.releaseYear}
                matchPercentage={item.matchPercentage || 0}
                inWatchlist={true}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MyList;