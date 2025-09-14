"use client";
import { motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRef } from "react";

import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { fadeUp, stagger } from "./motion";

type MotionSectionProps = {
  children: React.ReactNode;
  className?: string;
  viewportMargin?: string | number;
};

export function MotionSection({ 
  children, 
  className, 
  viewportMargin = "-80px 0px -80px 0px" 
}: MotionSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    margin: viewportMargin as any, 
    once: true 
  });
  const reduce = useReducedMotionPref();
  const controls = reduce ? "show" : inView ? "show" : "hidden";
  
  return (
    <motion.section 
      ref={ref} 
      className={className}
      initial="hidden" 
      animate={controls} 
      variants={fadeUp}
    >
      {children}
    </motion.section>
  );
}

type StaggerListProps = {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
};

export function StaggerList({ 
  children, 
  className, 
  staggerDelay = 0.08 
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotionPref();
  const controls = reduce ? "show" : inView ? "show" : "hidden";
  
  const staggerVariants: Variants = {
    show: { 
      transition: { 
        staggerChildren: staggerDelay, 
        delayChildren: staggerDelay 
      } 
    } 
  };
  
  return (
    <motion.div 
      ref={ref} 
      className={className}
      initial="hidden" 
      animate={controls} 
      variants={staggerVariants}
    >
      {children}
    </motion.div>
  );
}

type MotionItemProps = {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
};

export function MotionItem({ 
  children, 
  variants = fadeUp, 
  className 
}: MotionItemProps) {
  return (
    <motion.div 
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

// Parallax hook for hero image
export function useParallax() {
  const ref = useRef<HTMLDivElement>(null);
  
  return {
    ref,
    style: {
      transform: "translateY(var(--parallax-offset, 0px))",
    }
  };
}
