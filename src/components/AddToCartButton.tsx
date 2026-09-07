import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Loader2Icon, ShoppingCartIcon } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

type Phase = 'idle' | 'loading' | 'done';

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  color?: string;
  originRef?: React.RefObject<HTMLElement>;
  size?: 'sm' | 'md';
  variant?: 'solid' | 'outline';
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  color,
  originRef,
  size = 'sm',
  variant = 'solid',
  className = ''
}: AddToCartButtonProps) {
  const { addToCart } = useStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  const handleClick = () => {
    if (phase !== 'idle' || !product.inStock) return;
    setPhase('loading');
    timers.current.push(
      window.setTimeout(() => {
        addToCart(product, quantity, color, originRef?.current ?? null);
        setPhase('done');
      }, 480)
    );
    timers.current.push(window.setTimeout(() => setPhase('idle'), 2000));
  };

  const base =
  size === 'sm' ?
  'h-9 text-[13px] gap-1.5 px-3' :
  'h-11 text-sm gap-2 px-5';

  const skin =
  variant === 'solid' ?
  'bg-brand-500 text-white hover:bg-brand-600' :
  'border border-ink-200 text-ink-800 hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-100';

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={!product.inStock}
      whileHover={product.inStock ? { scale: 1.02 } : undefined}
      whileTap={product.inStock ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      aria-label={`Add ${product.name} to cart`}
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${base} ${skin} ${className}`}>
      
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={product.inStock ? phase : 'oos'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center gap-1.5">
          
          {!product.inStock ?
          'Out of Stock' :
          phase === 'idle' ?
          <>
              <ShoppingCartIcon className="h-4 w-4" />
              Add to Cart
            </> :
          phase === 'loading' ?
          <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Adding...
            </> :

          <>
              <CheckIcon className="h-4 w-4" strokeWidth={3} />
              Added
            </>
          }
        </motion.span>
      </AnimatePresence>
    </motion.button>);

}