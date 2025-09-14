"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Variants } from "framer-motion";

import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";

type Props = {
  children: React.ReactNode;
  variants?: Variants;
  as?: React.ElementType;
  once?: boolean;
  className?: string;
  viewportMargin?: string; // e.g. "-100px 0px -100px 0px"
};

export default function Reveal({
  children,
  variants,
  as: Tag = motion.div,
  once = true,
  className,
  viewportMargin = "-80px 0px -80px 0px",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: viewportMargin, once });
  const reduce = useReducedMotionPref();
  const controls = reduce ? "show" : inView ? "show" : "hidden";
  
  return (
    <Tag 
      ref={ref} 
      className={className} 
      initial="hidden" 
      animate={controls} 
      variants={variants}
    >
      {children}
    </Tag>
  );
}
