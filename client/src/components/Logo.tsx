import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

/**
 * Logo component for the StreamVerse app
 * Uses text rather than an image for faster loading and better accessibility
 */
export default function Logo({ 
  size = 'md', 
  className = '',
  href = '/'
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl'
  };

  const content = (
    <span className={cn(
      "text-primary font-heading font-bold transition-colors duration-200",
      sizeClasses[size],
      className
    )}>
      StreamVerse
    </span>
  );

  // If href is provided, wrap in Link component
  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  // Otherwise, just return the logo text
  return content;
}