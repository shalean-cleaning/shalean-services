import { Variants } from "framer-motion";

// Motion tokens as specified
export const motionTokens = {
  duration: {
    quick: 0.35,
    base: 0.6,
  },
  easing: [0.22, 1, 0.36, 1] as [number, number, number, number],
  spring: { type: "spring" as const, stiffness: 220, damping: 26 },
};

// Enhanced variants with new specifications
export const fadeUp: Variants = {
  hidden: { y: 24, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: motionTokens.duration.base, 
      ease: motionTokens.easing 
    } 
  }
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { 
    opacity: 1, 
    transition: { 
      duration: motionTokens.duration.base, 
      ease: motionTokens.easing 
    } 
  }
};

export const popCard: Variants = {
  hidden: { scale: 0.96, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1, 
    transition: motionTokens.spring 
  }
};

export const stagger: Variants = { 
  show: { 
    transition: { 
      staggerChildren: 0.08, 
      delayChildren: 0.08 
    } 
  } 
};

// Additional variants for specific use cases
export const slideInLeft: Variants = {
  hidden: { x: -24, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: motionTokens.duration.base, 
      ease: motionTokens.easing 
    } 
  }
};

export const slideInRight: Variants = {
  hidden: { x: 24, opacity: 0 },
  show: { 
    x: 0, 
    opacity: 1, 
    transition: { 
      duration: motionTokens.duration.base, 
      ease: motionTokens.easing 
    } 
  }
};

export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: { 
    scale: 1, 
    opacity: 1, 
    transition: motionTokens.spring 
  }
};

export const float: Variants = {
  hidden: { y: 0 },
  show: { 
    y: [-2, 0, -2],
    transition: { 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    } 
  }
};
