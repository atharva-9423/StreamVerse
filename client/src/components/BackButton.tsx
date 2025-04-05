import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

const BackButton = ({ className = '' }: BackButtonProps) => {
  const [location, setLocation] = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);

  // Check if we can go back
  useEffect(() => {
    // Set canGoBack based on history state
    setCanGoBack(window.history.length > 1);
    
    // Listen for navigation events to update canGoBack state
    const handleNavigation = () => {
      setCanGoBack(window.history.length > 1);
    };
    
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('pushstate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('pushstate', handleNavigation);
    };
  }, [location]);

  const handleBack = useCallback(() => {
    // We use the browser's history API for going back
    if (canGoBack) {
      window.history.back();
    } else {
      // If there's no history, go to the home page
      setLocation('/');
    }
  }, [canGoBack, setLocation]);

  // Don't show the back button on the home page or if we can't go back
  if (location === '/') {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleBack}
      className={`rounded-full p-2 hover:bg-primary hover:text-primary-foreground transition-colors ${className}`}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

export default BackButton;