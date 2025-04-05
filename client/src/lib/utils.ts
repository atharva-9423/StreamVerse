import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let result = '';
  
  if (hrs > 0) {
    result += `${hrs}:${mins < 10 ? '0' : ''}`;
  }
  
  result += `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  
  return result;
}

export function formatRemainingTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins < 10 ? '0' : ''}${mins}:00 remaining`;
  }
  
  return `${mins}:00 remaining`;
}

// Genre-based color scheme for mood lighting
export type GenreMoodLighting = {
  primary: string;      // Main color
  secondary: string;    // Accent color
  glow: string;         // Neon glow color
  intensity: number;    // Intensity of the effect (0-1)
  animation?: string;   // CSS animation name
};

// Map of genre to mood lighting configuration
export const genreMoodMap: Record<string, GenreMoodLighting> = {
  // Action - intense red with orange accents
  "Action": {
    primary: "#ff3a2f",
    secondary: "#ff8c42",
    glow: "rgba(255, 58, 47, 0.7)",
    intensity: 0.85,
    animation: "pulse-slow",
  },
  
  // Adventure - vibrant teal and gold
  "Adventure": {
    primary: "#00b4d8",
    secondary: "#ffca3a",
    glow: "rgba(0, 180, 216, 0.6)",
    intensity: 0.7,
    animation: "shimmer-horizontal",
  },
  
  // Animation - playful purple and pink
  "Animation": {
    primary: "#8338ec",
    secondary: "#ff006e",
    glow: "rgba(131, 56, 236, 0.7)",
    intensity: 0.7,
    animation: "bounce-subtle",
  },
  
  // Comedy - bright yellow and green
  "Comedy": {
    primary: "#ffea00",
    secondary: "#57cc99",
    glow: "rgba(255, 234, 0, 0.5)",
    intensity: 0.6,
    animation: "wobble",
  },
  
  // Crime - deep blue and cold white
  "Crime": {
    primary: "#003566",
    secondary: "#e6f1ff",
    glow: "rgba(0, 53, 102, 0.8)",
    intensity: 0.75,
    animation: "flicker",
  },
  
  // Documentary - subtle green and amber
  "Documentary": {
    primary: "#588157",
    secondary: "#d4a373",
    glow: "rgba(88, 129, 87, 0.4)",
    intensity: 0.4,
  },
  
  // Drama - muted purple and gold
  "Drama": {
    primary: "#5a189a",
    secondary: "#ffb700",
    glow: "rgba(90, 24, 154, 0.6)",
    intensity: 0.65,
    animation: "fade-in-out",
  },
  
  // Fantasy - magical blue-purple and warm yellow
  "Fantasy": {
    primary: "#7209b7",
    secondary: "#ffd60a",
    glow: "rgba(114, 9, 183, 0.75)",
    intensity: 0.8,
    animation: "sparkle",
  },
  
  // Horror - blood red and shadowy black
  "Horror": {
    primary: "#9d0208",
    secondary: "#161a1d",
    glow: "rgba(157, 2, 8, 0.8)",
    intensity: 0.9,
    animation: "flicker-intense",
  },
  
  // Romance - rose pink and soft lavender
  "Romance": {
    primary: "#ff5d8f",
    secondary: "#9d4edd",
    glow: "rgba(255, 93, 143, 0.65)",
    intensity: 0.6,
    animation: "pulse-gentle",
  },
  
  // Sci-Fi - neon blue and electric cyan
  "Sci-Fi": {
    primary: "#3a86ff",
    secondary: "#00f5d4",
    glow: "rgba(58, 134, 255, 0.9)",
    intensity: 0.95,
    animation: "scanning",
  },
  
  // Thriller - intense orange and dark blue
  "Thriller": {
    primary: "#fb5607",
    secondary: "#03071e",
    glow: "rgba(251, 86, 7, 0.75)",
    intensity: 0.8,
    animation: "pulse-irregular",
  },
  
  // Default - neutral blue
  "default": {
    primary: "#4895ef",
    secondary: "#a2d2ff",
    glow: "rgba(72, 149, 239, 0.5)",
    intensity: 0.5,
  }
};

// Get mood lighting based on genre
export function getMoodLighting(genres: string[] = []): GenreMoodLighting {
  if (!genres.length) return genreMoodMap.default;
  
  // Use the first genre that has a defined mood
  for (const genre of genres) {
    if (genreMoodMap[genre]) {
      return genreMoodMap[genre];
    }
  }
  
  return genreMoodMap.default;
}

// Create CSS variables for mood lighting
export function generateMoodLightingStyles(lighting: GenreMoodLighting): Record<string, string> {
  return {
    '--mood-primary': lighting.primary,
    '--mood-secondary': lighting.secondary,
    '--mood-glow': lighting.glow,
    '--mood-intensity': lighting.intensity.toString(),
    '--mood-animation': lighting.animation || 'none',
  };
}

// Create placeholder poster/backdrop URL with embedded SVGs for faster loading
export function getPlaceholderImage(type: string = 'poster', title?: string) {
  // Base anime-themed colors
  const bg = '1a1a2e'; // Dark blue background
  const textColor = 'e8e8e8'; // Light text
  const accentColor = '7678ed'; // Purple accent
  
  // Generate SVG placeholder for faster loading (no external request needed)
  const displayTitle = title ? truncateText(title, 15) : 'Anime';
  
  if (type === 'poster') {
    // Create anime-style poster placeholder (2:3 ratio)
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23${bg}'/%3E%3Cpath d='M150 140 L190 170 L150 200 L110 170 Z' fill='%23${accentColor}' opacity='0.7'/%3E%3Ctext x='150' y='250' font-family='Arial' font-size='20' fill='%23${textColor}' text-anchor='middle'%3E${displayTitle}%3C/text%3E%3Ctext x='150' y='280' font-family='Arial' font-size='16' fill='%23${textColor}' opacity='0.7' text-anchor='middle'%3EAnime%3C/text%3E%3C/svg%3E`;
  } else if (type === 'backdrop') {
    // Create anime-style backdrop placeholder (16:9 ratio)
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'%3E%3Crect width='1280' height='720' fill='%23${bg}'/%3E%3Cpath d='M640 200 L720 300 L640 400 L560 300 Z' fill='%23${accentColor}' opacity='0.5'/%3E%3Ctext x='640' y='500' font-family='Arial' font-size='30' fill='%23${textColor}' text-anchor='middle'%3E${displayTitle}%3C/text%3E%3Ctext x='640' y='550' font-family='Arial' font-size='24' fill='%23${textColor}' opacity='0.7' text-anchor='middle'%3EAnime%3C/text%3E%3C/svg%3E`;
  } else if (type === 'profile') {
    // Create anime-style avatar placeholder (1:1 ratio)
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23${bg}'/%3E%3Ccircle cx='100' cy='80' r='40' fill='%23${textColor}' opacity='0.7'/%3E%3Ccircle cx='100' cy='180' r='70' fill='%23${textColor}' opacity='0.5'/%3E%3C/svg%3E`;
  }
  
  // Default placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23${bg}'/%3E%3Ctext x='200' y='200' font-family='Arial' font-size='24' fill='%23${textColor}' text-anchor='middle'%3E${displayTitle}%3C/text%3E%3C/svg%3E`;
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
