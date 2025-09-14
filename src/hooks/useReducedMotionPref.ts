"use client";
import { useEffect, useState } from "react";

export function useReducedMotionPref() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setPrefersReduced(mq.matches);
    set(); 
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, []);
  
  return prefersReduced;
}
