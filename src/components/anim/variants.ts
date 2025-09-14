import { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
  }
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } 
  }
};

export const stagger: Variants = { 
  show: { 
    transition: { 
      staggerChildren: 0.07, 
      delayChildren: 0.05 
    } 
  } 
};
