import { useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useParallax from '@/hooks/useParallax';

interface FeaturedContentProps {
  content: {
    id: number;
    title: string;
    overview: string;
    backdropPath: string;
  };
}

const FeaturedContent = ({ content }: FeaturedContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { offset } = useParallax(ref, { speed: 0.3 });

  return (
    <section 
      ref={ref}
      className="relative parallax-hero h-hero-sm my-8 overflow-hidden"
      style={{
        backgroundImage: `url(${content.backdropPath})`
      }}
    >
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${content.backdropPath})`,
          y: offset 
        }}
      />
      
      <div className="relative w-full h-full flex items-center bg-gradient-to-r from-background via-background/80 to-transparent">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-accent font-accent font-medium">FEATURED</span>
              <span className="block h-0.5 w-10 bg-accent"></span>
            </div>
            <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
              {content.title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {content.overview}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href={`/watch/${content.id}`}>
                <Button className="flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded font-medium transition">
                  <Play className="mr-2 h-5 w-5" /> Watch Now
                </Button>
              </Link>
              <Button variant="outline" className="flex items-center justify-center bg-muted hover:bg-muted text-foreground px-6 py-3 rounded font-medium border border-border transition">
                <Plus className="mr-2 h-5 w-5" /> Add to List
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedContent;
