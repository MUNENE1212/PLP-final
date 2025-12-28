import { Variants, Transition } from 'framer-motion';

/**
 * Animation transition defaults
 */
export const transition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const transitionSmooth: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
};

/**
 * Fade animations
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition,
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition,
  },
};

/**
 * Scale animations
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

export const scaleOut: Variants = {
  hidden: { opacity: 1, scale: 1 },
  visible: {
    opacity: 0,
    scale: 0.9,
    transition: transitionSmooth,
  },
};

/**
 * Slide animations (with layout)
 */
export const slideInFromBottom: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: transitionSmooth,
  },
};

export const slideInFromTop: Variants = {
  hidden: { y: '-100%' },
  visible: {
    y: 0,
    transition: transitionSmooth,
  },
};

export const slideInFromLeft: Variants = {
  hidden: { x: '-100%' },
  visible: {
    x: 0,
    transition: transitionSmooth,
  },
};

export const slideInFromRight: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: transitionSmooth,
  },
};

/**
 * Modal animations
 */
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

/**
 * Bottom sheet animations (mobile)
 */
export const bottomSheetOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const bottomSheetContent: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25 },
  },
};

/**
 * List/Stagger animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition,
  },
};

/**
 * Card hover animations
 */
export const cardHover = {
  whileHover: {
    y: -4,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
  },
};

/**
 * Button press animations
 */
export const buttonPress = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 },
};

/**
 * Page transition animations
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionSmooth,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transitionSmooth,
  },
};

/**
 * Loading/Skeleton animations
 */
export const skeletonPulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const shimmer: Variants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/**
 * Notification/Toast animations
 */
export const toastSlideIn: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

/**
 * Dropdown/Menu animations
 */
export const dropdownMenu: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

/**
 * Tooltip animations
 */
export const tooltip: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.1 },
  },
};

/**
 * Progress/Loading bar animations
 */
export const progressBar: Variants = {
  hidden: { width: '0%' },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 1,
    },
  }),
};

/**
 * Icon animations
 */
export const iconSpin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const iconBounce = {
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const iconPulse = {
  animate: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Layout animations
 */
export const layoutAnimation = {
  layout: true,
  transition: {
    type: 'spring',
    stiffness: 350,
    damping: 35,
  },
};

/**
 * Preset combinations
 */
export const animations = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleOut,
  slideInFromBottom,
  slideInFromTop,
  slideInFromLeft,
  slideInFromRight,
  modalOverlay,
  modalContent,
  bottomSheetOverlay,
  bottomSheetContent,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonPress,
  pageTransition,
  skeletonPulse,
  shimmer,
  toastSlideIn,
  dropdownMenu,
  tooltip,
  progressBar,
  iconSpin,
  iconBounce,
  iconPulse,
};

/**
 * Animation helper hooks
 */
export const getStaggerChildren = (count: number, delay: number = 0.1) => ({
  visible: {
    transition: {
      staggerChildren: delay,
      delayChildren: 0.2,
    },
  },
});
