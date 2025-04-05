import { useEffect, useState, RefObject } from 'react';

interface ParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
  disabled?: boolean;
}

/**
 * Hook to create a parallax scrolling effect
 * @param ref Reference to the element to apply parallax to
 * @param options Parallax configuration options
 * @returns Object with current offset value
 */
export function useParallax(
  ref: RefObject<HTMLElement>, 
  options: ParallaxOptions = {}
) {
  const { speed = 0.5, direction = 'up', disabled = false } = options;
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    if (disabled || !ref.current) return;
    
    const handleScroll = () => {
      if (!ref.current) return;
      
      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if element is in viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        // Calculate parallax offset based on element position
        const scrollPosition = window.scrollY;
        const elementOffsetTop = scrollPosition + rect.top;
        const elementHeight = rect.height;
        
        // Calculate how far the element is from the top of the viewport
        const elementMiddle = elementOffsetTop + elementHeight / 2;
        const distanceFromScreenMiddle = elementMiddle - scrollPosition - windowHeight / 2;
        
        // Apply parallax effect
        const parallaxOffset = distanceFromScreenMiddle * speed * (direction === 'up' ? -1 : 1);
        
        setOffset(parallaxOffset);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initialize
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [ref, speed, direction, disabled]);
  
  return { offset };
}

export default useParallax;
