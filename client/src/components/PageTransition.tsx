import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  // Animation variants: fade, slide, scale, rotate, etc.
  variant?: "fade" | "slide" | "scale" | "slideUp" | "zoomFade";
}

export default function PageTransition({
  children,
  className = "",
  variant = "fade",
}: PageTransitionProps) {
  // Define different animation variants
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
    },
    slide: {
      initial: { x: 15, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { x: -15, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { scale: 0.98, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
    },
    slideUp: {
      initial: { y: 15, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
      exit: { y: -15, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
    },
    zoomFade: {
      initial: { scale: 0.98, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1, 
        transition: { 
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for smooth motion
        } 
      },
      exit: { 
        scale: 0.95, 
        opacity: 0, 
        transition: { 
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1]
        } 
      },
    },
  };

  // Select the appropriate variant
  const selectedVariant = variants[variant];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={selectedVariant}
      className={className}
      style={{ position: "relative", width: "100%" }}
    >
      {children}
    </motion.div>
  );
}