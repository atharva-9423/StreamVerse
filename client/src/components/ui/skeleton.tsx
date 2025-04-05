import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "text" | "avatar" | "banner";
  animated?: boolean;
}

export function Skeleton({
  className,
  variant = "default",
  animated = true,
  ...props
}: SkeletonProps) {
  const { theme } = useTheme();
  
  // Base styles for all skeleton variants
  const baseStyles = "bg-muted relative overflow-hidden";
  
  // Animation class based on theme
  const animationClass = animated 
    ? theme === 'dark' 
      ? "after:absolute after:inset-0 after:w-full after:h-full after:animate-skeleton-glow-dark" 
      : "after:absolute after:inset-0 after:w-full after:h-full after:animate-skeleton-glow-light"
    : "";
  
  // Shimmer effect for a more dynamic look
  const shimmerClass = animated
    ? "before:absolute before:inset-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:bg-[length:200%_100%] before:animate-shimmer"
    : "";
  
  // Variant-specific styles
  const variantStyles = {
    default: "rounded-md",
    card: "rounded-xl h-full",
    text: "h-4 w-full rounded",
    avatar: "rounded-full",
    banner: "h-52 rounded-xl"
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationClass,
        shimmerClass,
        className
      )}
      {...props}
    />
  );
}

// Specialized skeleton components for common use cases
export function CardSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Skeleton variant="card" className="h-32" />
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
  );
}

export function ContentCardSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <div className={cn("aspect-[2/3] relative rounded-md overflow-hidden", className)} {...props}>
      <Skeleton variant="card" className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <Skeleton variant="text" className="h-3 w-3/4 bg-white/20" />
        <Skeleton variant="text" className="h-2 w-1/2 mt-1 bg-white/20" />
      </div>
    </div>
  );
}

export function ContentSectionSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <Skeleton variant="text" className="h-6 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <ContentCardSkeleton 
            key={i} 
            style={{ 
              animationDelay: `${i * 0.1}s`,
              animation: "pop-in 0.3s ease-out forwards",
              opacity: 0
            }} 
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton({ className, ...props }: React.ComponentProps<typeof Skeleton>) {
  return (
    <div className={cn("relative h-[70vh] w-full", className)} {...props}>
      <Skeleton variant="banner" className="absolute inset-0 h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-background to-transparent">
        <div className="container mx-auto">
          <Skeleton 
            variant="text" 
            className="h-12 w-2/3 mb-4" 
            style={{ animation: "slide-up 0.4s ease-out 0.1s forwards", opacity: 0 }}
          />
          <Skeleton 
            variant="text" 
            className="h-5 w-1/2 mb-3" 
            style={{ animation: "slide-up 0.4s ease-out 0.2s forwards", opacity: 0 }}
          />
          <Skeleton 
            variant="text" 
            className="h-5 w-3/4 mb-3" 
            style={{ animation: "slide-up 0.4s ease-out 0.3s forwards", opacity: 0 }}
          />
          <Skeleton 
            variant="text" 
            className="h-5 w-2/3 mb-6" 
            style={{ animation: "slide-up 0.4s ease-out 0.4s forwards", opacity: 0 }}
          />
          <div className="flex space-x-3 mt-6">
            <Skeleton 
              className="h-10 w-32 rounded-md" 
              style={{ animation: "slide-up 0.4s ease-out 0.5s forwards", opacity: 0 }}
            />
            <Skeleton 
              className="h-10 w-32 rounded-md" 
              style={{ animation: "slide-up 0.4s ease-out 0.6s forwards", opacity: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}