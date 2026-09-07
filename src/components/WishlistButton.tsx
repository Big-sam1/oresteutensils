import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

export function WishlistButton({
  product,
  floating = true



}: {product: Product;floating?: boolean;}) {
  const { toggleWishlist, isWishlisted } = useStore();
  const active = isWishlisted(product.id);
  const reduce = useReducedMotion();
  const [burstKey, setBurstKey] = useState(0);

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!active) setBurstKey((k) => k + 1);
        toggleWishlist(product);
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      className={`relative flex items-center justify-center rounded-full transition-colors duration-200 ${
      floating ?
      'h-8 w-8 border border-ink-200 bg-white/95 shadow-sm dark:border-ink-700 dark:bg-ink-900/95' :
      'h-6 w-6'} ${
      active ? 'text-red-500' : 'text-ink-500 hover:text-red-500 dark:text-ink-300'}`}>
      
      <motion.span
        key={active ? 'on' : 'off'}
        animate={reduce ? undefined : { scale: [1, 1.28, 1] }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="block">
        
        <HeartIcon
          className={`h-4 w-4 transition-colors duration-300 ${active ? 'fill-red-500' : 'fill-transparent'}`} />
        
      </motion.span>

      {!reduce &&
      <AnimatePresence>
          {active &&
        <motion.span
          key={burstKey}
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}>
          
              {[0, 1, 2].map((i) =>
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-red-400"
            initial={{ x: -3, y: -3, opacity: 1, scale: 1 }}
            animate={{
              x: [-3, -14 + i * 14],
              y: [-3, -20 - i * 4],
              opacity: [1, 0],
              scale: [1, 0.4]
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }} />

          )}
            </motion.span>
        }
        </AnimatePresence>
      }
    </motion.button>);

}