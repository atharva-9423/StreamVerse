import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  aspectRatio?: string;
  skeletonClassName?: string;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  fallbackSrc,
  aspectRatio = '16 / 9',
  skeletonClassName = '',
  ...props
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    
    if (!src) {
      setError(true);
      setIsLoading(false);
      return;
    }
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
      if (fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  if (isLoading) {
    return (
      <div 
        className={`relative overflow-hidden bg-muted ${skeletonClassName}`}
        style={{ aspectRatio }}
      >
        <Skeleton className="w-full h-full absolute inset-0" />
      </div>
    );
  }

  if (error && !fallbackSrc) {
    // Placeholder for missing images
    return (
      <div 
        className={`flex items-center justify-center bg-muted/80 text-muted-foreground ${className}`}
        style={{ aspectRatio }}
        {...props}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 opacity-50">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${className}`}
      loading="lazy"
      {...props}
    />
  );
}