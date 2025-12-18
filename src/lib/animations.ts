import { type Variants } from "framer-motion";

/**
 * Common animation presets for the Quatt Support Dashboard
 * Using Framer Motion variants for consistent animations across the app
 */

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Fade in animation
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide in from right (for modals/drawers)
export const slideInRightVariants: Variants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Slide in from left
export const slideInLeftVariants: Variants = {
  initial: {
    x: "-100%",
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Scale up (for modals)
export const scaleUpVariants: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Stagger children animations
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Card hover effect
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

// Button press effect
export const buttonTapVariants: Variants = {
  tap: {
    scale: 0.95,
  },
};

// Loading spinner rotation
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

// Notification/toast slide in from top
export const notificationVariants: Variants = {
  initial: {
    y: -100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// Collapse/expand animation
export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};
