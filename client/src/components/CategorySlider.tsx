import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

interface CategorySliderProps {
  onSelectGenre: (genre: string) => void;
  selectedGenre: string;
}

const CategorySlider = ({ onSelectGenre, selectedGenre }: CategorySliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const { data: genres = [] } = useQuery({
    queryKey: ['/api/genres'],
  });

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="relative py-8 px-4 md:px-6">
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      <motion.div
        ref={sliderRef}
        className="category-slider flex items-center space-x-4 overflow-x-auto pb-4"
        onScroll={handleScroll}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          className={cn(
            "genre-pill whitespace-nowrap px-6 py-2 bg-muted text-foreground rounded-full hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground transition",
            selectedGenre === "All" && "bg-primary text-primary-foreground"
          )}
          onClick={() => onSelectGenre("All")}
        >
          All
        </button>

        {genres.map((genre: any) => (
          <button
            key={genre.id}
            className={cn(
              "genre-pill whitespace-nowrap px-6 py-2 bg-muted text-foreground rounded-full hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground transition",
              selectedGenre === genre.name && "bg-primary text-primary-foreground"
            )}
            onClick={() => onSelectGenre(genre.name)}
          >
            {genre.name}
          </button>
        ))}
      </motion.div>

      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm"
          onClick={scrollRight}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default CategorySlider;
