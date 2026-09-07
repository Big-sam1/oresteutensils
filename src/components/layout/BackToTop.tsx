import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpIcon } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible &&
      <motion.button
        type="button"
        aria-label="Back to top"
        onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: reduce ? 'auto' : 'smooth'
        })
        }
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 10 }}
        whileHover={{ y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        className="fixed bottom-5 left-4 z-[75] flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-lift transition-colors duration-200 hover:bg-brand-600">
        
          <ArrowUpIcon className="h-5 w-5" />
        </motion.button>
      }
    </AnimatePresence>);

}