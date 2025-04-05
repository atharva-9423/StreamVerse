import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Plus, Check, Info, Share2 } from 'lucide-react';
import { cn, getMoodLighting, generateMoodLightingStyles, getPlaceholderImage } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import ShareButton from '@/components/ShareButton';
import MoodLighting from '@/components/MoodLighting';
import LazyImage from '@/components/LazyImage';

interface ContentCardProps {
  id: number;
  title: string;
  posterPath: string;
  releaseYear: number;
  matchPercentage: number;
  inWatchlist?: boolean;
  genres?: string[];
}

const ContentCard = ({
  id,
  title,
  posterPath,
  releaseYear,
  matchPercentage,
  inWatchlist = false,
  genres = ['default']
}: ContentCardProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(inWatchlist);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D tilt animation values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);
  
  // Add springy physics to make animations feel more natural
  const springConfig = { damping: 15, stiffness: 150 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  const scaleSpring = useSpring(1, springConfig);

  // Handle mouse movements for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate offset from center
    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;
    
    // Update motion values
    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseEnter = () => {
    scaleSpring.set(1.05);
  };
  
  const handleMouseLeave = () => {
    if (!isHovered) {
      x.set(0);
      y.set(0);
      scaleSpring.set(1);
    }
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsHovered(!isHovered);
  };

  const handleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
        contentId: id,
        add: !isInWatchlist
      });
      
      setIsInWatchlist(!isInWatchlist);
      
      toast({
        title: isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
        description: `${title} has been ${isInWatchlist ? 'removed from' : 'added to'} your watchlist.`,
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

  // Animation variants
  const imageVariants = {
    hover: { scale: 1.12, transition: { duration: 0.5 } },
    initial: { scale: 1, transition: { duration: 0.3 } }
  };
  
  const infoVariants = {
    hover: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, delay: 0.1 }
    },
    initial: { 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 }
    }
  };
  
  const buttonVariants = {
    hover: (i: number) => ({ 
      scale: 1.1, 
      transition: { duration: 0.2, delay: 0.1 + (i * 0.05) }
    }),
    initial: { 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  return (
    <MoodLighting genres={genres} variant="neon-border" className="rounded-md" intensity={isHovered ? 0.9 : 0.4}>
      <motion.div
        ref={cardRef}
        className="content-card group relative perspective-500"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          zIndex: isHovered ? 10 : 0,
          scale: scaleSpring,
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: "preserve-3d",
        }}
      >
        <div className="cursor-pointer" onClick={handleClick}>
          <div className="aspect-[2/3] rounded-md overflow-hidden shadow-md">
            <motion.div
              className="w-full h-full"
              variants={imageVariants}
              initial="initial"
              animate={isHovered ? "hover" : "initial"}
            >
              <LazyImage 
                src={posterPath} 
                alt={`${title} poster`} 
                className="w-full h-full object-cover"
                fallbackSrc={getPlaceholderImage('poster', title)}
                aspectRatio="2/3"
              />
            </motion.div>
            
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent flex flex-col justify-end p-3"
              variants={infoVariants}
              initial="initial"
              animate={isHovered ? "hover" : "initial"}
            >
              <motion.div 
                className="bg-white/80 dark:bg-background/80 backdrop-blur-sm p-2 rounded shadow-md"
                style={{ transform: "translateZ(20px)" }}
                initial={{ y: 20, opacity: 0 }}
                animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 300,
                  delay: isHovered ? 0.1 : 0
                }}
              >
                <h3 className="font-heading font-semibold text-black dark:text-white text-sm md:text-base line-clamp-1">
                  {title}
                </h3>
                <div className="flex items-center space-x-2 mt-1 text-xs md:text-sm">
                  <span className="text-primary font-medium">
                    {matchPercentage}% Match
                  </span>
                  <span className="text-black dark:text-white">{releaseYear}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <MoodLighting genres={genres} variant="interactive" intensity={0.8}>
                    <Link href={`/content/${id}`}>
                      <motion.button 
                        className="p-1.5 bg-white dark:bg-black/50 rounded-full text-background dark:text-white border border-black/10 dark:border-white/10"
                        variants={buttonVariants}
                        initial="initial"
                        animate={isHovered ? "hover" : "initial"}
                        custom={0}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4" />
                      </motion.button>
                    </Link>
                  </MoodLighting>
                  
                  <MoodLighting genres={genres} variant="interactive" intensity={0.7}>
                    <motion.button
                      className="p-1.5 bg-white/90 dark:bg-black/50 rounded-full text-black dark:text-white border border-black/20 dark:border-white/10"
                      onClick={handleWatchlist}
                      variants={buttonVariants}
                      initial="initial"
                      animate={isHovered ? "hover" : "initial"}
                      custom={1}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isInWatchlist ? (
                        <Check className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </motion.button>
                  </MoodLighting>
                  
                  <MoodLighting genres={genres} variant="interactive" intensity={0.6}>
                    <motion.div
                      variants={buttonVariants}
                      initial="initial"
                      animate={isHovered ? "hover" : "initial"}
                      custom={2}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ShareButton 
                        title={title}
                        contentId={id}
                        imageUrl={posterPath}
                        variant="outline"
                        size="icon"
                        showLabel={false}
                        className="p-1.5 bg-white/90 dark:bg-black/50 rounded-full text-black dark:text-white border border-black/20 dark:border-white/10"
                      >
                        <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                      </ShareButton>
                    </motion.div>
                  </MoodLighting>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </MoodLighting>
  );
};

export default ContentCard;