import { toast } from 'react-hot-toast';

/**
 * FannyBags Animation Utilities
 * Color scheme: Purple #50207A, Pink #FF48B9, Green #12CE6A
 */

// Animation variants for Framer Motion
export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const slideUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 60 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.3 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Toast notification helpers with FannyBags branding
export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#12CE6A',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px'
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#12CE6A'
      }
    });
  },
  
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#FF48B9',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px'
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#FF48B9'
      }
    });
  },
  
  loading: (message) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#50207A',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px'
      }
    });
  },
  
  custom: (message, options = {}) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#1A1A1A',
        color: '#fff',
        fontWeight: '600',
        borderRadius: '12px',
        padding: '16px',
        ...options.style
      }
    });
  }
};

// Easing functions
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1]
};

// Utility to combine class names
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}