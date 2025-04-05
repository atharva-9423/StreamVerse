import React, { useEffect, useState } from 'react';
import { getMoodLighting, generateMoodLightingStyles, type GenreMoodLighting } from '@/lib/utils';

interface MoodLightingProps {
  genres: string[];
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'atmospheric' | 'neon-border' | 'interactive'; 
  intensity?: number; // Optional override for the default intensity
}

/**
 * MoodLighting component adds genre-specific, contextual mood lighting effects
 * to its children based on the content genres
 */
export default function MoodLighting({
  genres,
  children,
  className = '',
  variant = 'default',
  intensity
}: MoodLightingProps) {
  const [moodLighting, setMoodLighting] = useState<GenreMoodLighting>(() => getMoodLighting(genres));
  const [moodStyles, setMoodStyles] = useState<Record<string, string>>({});
  
  // Update mood lighting when genres change
  useEffect(() => {
    const lighting = getMoodLighting(genres);
    
    // Apply custom intensity if provided
    if (intensity !== undefined) {
      lighting.intensity = Math.max(0, Math.min(1, intensity));
    }
    
    setMoodLighting(lighting);
    setMoodStyles(generateMoodLightingStyles(lighting));
  }, [genres, intensity]);
  
  // Map variant to specific class
  const variantClass = {
    'default': 'mood-lighting',
    'atmospheric': 'mood-atmospheric',
    'neon-border': 'mood-neon-border',
    'interactive': 'mood-interactive'
  }[variant];
  
  return (
    <div className={`${variantClass} ${className}`} style={moodStyles}>
      {children}
    </div>
  );
}

/**
 * MoodText component adds genre-specific text glow effects
 */
export function MoodText({
  genres,
  children,
  className = '',
  intensity,
  as: Component = 'span'
}: Omit<MoodLightingProps, 'variant'> & { as?: React.ElementType }) {
  const [moodLighting, setMoodLighting] = useState<GenreMoodLighting>(() => getMoodLighting(genres));
  const [moodStyles, setMoodStyles] = useState<Record<string, string>>({});
  
  // Update mood lighting when genres change
  useEffect(() => {
    const lighting = getMoodLighting(genres);
    
    // Apply custom intensity if provided
    if (intensity !== undefined) {
      lighting.intensity = Math.max(0, Math.min(1, intensity));
    }
    
    setMoodLighting(lighting);
    setMoodStyles(generateMoodLightingStyles(lighting));
  }, [genres, intensity]);
  
  return (
    <Component className={`mood-text-glow ${className}`} style={moodStyles}>
      {children}
    </Component>
  );
}

/**
 * MoodBadge component creates a glowing badge with genre-specific styling
 */
export function MoodBadge({
  genres,
  children,
  className = '',
  intensity
}: Omit<MoodLightingProps, 'variant'>) {
  const [moodLighting, setMoodLighting] = useState<GenreMoodLighting>(() => getMoodLighting(genres));
  const [moodStyles, setMoodStyles] = useState<Record<string, string>>({});
  
  // Update mood lighting when genres change
  useEffect(() => {
    const lighting = getMoodLighting(genres);
    
    // Apply custom intensity if provided
    if (intensity !== undefined) {
      lighting.intensity = Math.max(0, Math.min(1, intensity));
    }
    
    setMoodLighting(lighting);
    setMoodStyles(generateMoodLightingStyles(lighting));
  }, [genres, intensity]);
  
  return (
    <span className={`mood-badge rounded-full px-3 py-1 text-sm ${className}`} style={moodStyles}>
      {children}
    </span>
  );
}

/**
 * MoodAccent component adds a subtle accent underline with genre-specific styling
 */
export function MoodAccent({
  genres,
  children,
  className = '',
  intensity,
  as: Component = 'span'
}: Omit<MoodLightingProps, 'variant'> & { as?: React.ElementType }) {
  const [moodLighting, setMoodLighting] = useState<GenreMoodLighting>(() => getMoodLighting(genres));
  const [moodStyles, setMoodStyles] = useState<Record<string, string>>({});
  
  // Update mood lighting when genres change
  useEffect(() => {
    const lighting = getMoodLighting(genres);
    
    // Apply custom intensity if provided
    if (intensity !== undefined) {
      lighting.intensity = Math.max(0, Math.min(1, intensity));
    }
    
    setMoodLighting(lighting);
    setMoodStyles(generateMoodLightingStyles(lighting));
  }, [genres, intensity]);
  
  return (
    <Component className={`mood-accent inline-block ${className}`} style={moodStyles}>
      {children}
    </Component>
  );
}