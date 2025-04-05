import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard from './ContentCard';

interface ContentSectionProps {
  title: string;
  items: any[];
  loading?: boolean;
}

const ContentSection = ({ title, items = [], loading = false }: ContentSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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

  return (
    <section className="py-8 px-4 md:px-6" ref={ref}>
      <div className="container mx-auto">
        <motion.h2
          className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        
        <div className="relative">
          {items.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute -left-5 z-10 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm hidden md:flex"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-5 z-10 top-1/2 -translate-y-1/2 bg-background/50 backdrop-blur-sm hidden md:flex"
                onClick={scrollRight}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="aspect-[2/3] rounded-md bg-muted animate-pulse"></div>
              ))}
            </div>
          ) : items.length > 0 ? (
            <motion.div
              ref={containerRef}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {items.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <ContentCard
                    id={item.id}
                    title={item.title}
                    posterPath={item.posterPath}
                    releaseYear={item.releaseYear}
                    matchPercentage={item.matchPercentage}
                    genres={item.genres || ['default']}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No content available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;
