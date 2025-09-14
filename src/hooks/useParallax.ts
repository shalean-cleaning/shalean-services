"use client";
import { useEffect, useRef } from "react";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

export function useParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionPref();
  
  useEffect(() => {
    if (reduce) return;
    
    const element = ref.current;
    if (!element) return;
    
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxOffset = Math.min(scrolled * 0.3, 16); // Max 16px offset
      element.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reduce]);
  
  return {
    ref,
    style: {
      transform: "translateY(var(--parallax-offset, 0px))",
    }
  };
}
