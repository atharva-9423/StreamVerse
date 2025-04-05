import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ContentCard from "@/components/ContentCard";
import { Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Extract the query parameter from the URL if it exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      setSearchQuery(q);
      setDebouncedQuery(q);
    }
    
    // Add keyboard shortcut for going back with Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.history.back();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // Debounce search query to avoid too many requests
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      // Update URL with search query
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set("q", searchQuery);
        const newRelativePathQuery = 
          window.location.pathname + "?" + params.toString();
        window.history.pushState(null, "", newRelativePathQuery);
      } else {
        // If search is empty, remove query from URL
        window.history.pushState(null, "", window.location.pathname);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  // Fetch search results
  const { data: allSearchResults = [], isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/content", { query: debouncedQuery }],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await fetch(`/api/content?query=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Failed to search content");
      return res.json();
    },
    enabled: debouncedQuery.length > 0,
  });
  
  // Limit results to 15 items for better performance
  const searchResults = allSearchResults.slice(0, 15);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect above
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative flex items-center justify-center mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute left-0 md:left-4 top-1/2 transform -translate-y-1/2"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-center text-foreground px-10">Search Anime</h1>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for anime titles, characters, genres..."
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        {debouncedQuery && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {isLoading 
                ? "Searching..." 
                : `Search results for "${debouncedQuery}" (${searchResults.length})`}
            </h2>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-card animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {searchResults.map((content) => (
              <ContentCard
                key={content.id}
                id={content.id}
                title={content.title}
                posterPath={content.posterPath}
                releaseYear={content.releaseYear}
                matchPercentage={content.matchPercentage || 0}
              />
            ))}
          </div>
        ) : debouncedQuery ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-muted-foreground">
              No results found for "{debouncedQuery}"
            </h3>
            <p className="mt-2 text-muted-foreground">
              Try different keywords or check for typos
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> key or click the back arrow to return to the previous page
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-muted-foreground">
              Start typing to search for anime
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Press <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> key or click the back arrow to return to the previous page
            </p>
          </div>
        )}
      </div>
    </div>
  );
}