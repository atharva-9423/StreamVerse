import { useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/LazyImage';
import { getPlaceholderImage } from '@/lib/utils';

interface HeroSectionProps {
  content: {
    id: number;
    title: string;
    overview: string;
    backdropPath: string;
    releaseYear: number;
    rating: string;
    type: string;
  };
}

const HeroSection = ({ content }: HeroSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]); // Parallax effect values

  // For opacity fade-out on scroll
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Additional info based on content type
  const additionalInfo = content.type === 'anime' 
    ? '3 Seasons'
    : '129 min';

  return (
    <motion.section
      ref={ref}
      className="relative h-hero overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background with parallax effect */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        style={{ y }}
      >
        <LazyImage 
          src={content.backdropPath}
          alt={`${content.title} backdrop`}
          className="w-full h-full object-cover"
          fallbackSrc={getPlaceholderImage('backdrop', content.title)}
          skeletonClassName="absolute inset-0"
        />
      </motion.div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      {/* Content */}
      <motion.div 
        className="relative w-full h-full flex items-end"
        style={{ opacity }}
      >
        <div className="container mx-auto px-4 md:px-6 pb-16 md:pb-24">
          <motion.div 
            className="max-w-xl"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="font-heading font-bold text-4xl md:text-6xl text-foreground mb-4">
              {content.title}
            </h1>
            <p className="text-muted-foreground mb-6">
              {content.overview}
            </p>
            <div className="flex items-center space-x-4">
              <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm">TOP 10</span>
              <span className="text-muted-foreground">{content.releaseYear}</span>
              <span className="text-muted-foreground">{content.rating}</span>
              <span className="text-muted-foreground">{additionalInfo}</span>
            </div>
            <div className="flex items-center mt-6 space-x-4">
              <Link href={`/watch/${content.id}`}>
                <Button className="flex items-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded font-medium transition">
                  <Play className="mr-2 h-5 w-5" /> Play
                </Button>
              </Link>
              <Link href={`/content/${content.id}`}>
                <Button variant="outline" className="flex items-center bg-muted hover:bg-muted text-foreground px-6 py-3 rounded font-medium border border-border transition">
                  <Info className="mr-2 h-5 w-5" /> More Info
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default HeroSection;
