import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md'
}: QuantitySelectorProps) {
  const [direction, setDirection] = React.useState(1);
  const dim = size === 'sm' ? 'h-8' : 'h-11';
  const btn = size === 'sm' ? 'w-8' : 'w-10';

  const step = (delta: number) => {
    const next = Math.max(min, Math.min(max, value + delta));
    if (next === value) return;
    setDirection(delta);
    onChange(next);
  };

  return (
    <div
      className={`flex shrink-0 items-center rounded-lg border border-ink-200 dark:border-ink-700 ${dim}`}>
      
      <motion.button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => step(-1)}
        whileTap={{ scale: 0.88 }}
        transition={{ duration: 0.14 }}
        className={`flex h-full items-center justify-center rounded-l-lg text-ink-600 transition-colors duration-200 hover:bg-ink-50 hover:text-brand-600 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-ink-800 ${btn}`}
        disabled={value <= min}>
        
        <MinusIcon className="h-3.5 w-3.5" />
      </motion.button>

      <span
        className={`relative flex h-full items-center justify-center overflow-hidden text-sm font-semibold text-ink-900 dark:text-white ${
        size === 'sm' ? 'w-8' : 'w-10'}`
        }
        aria-live="polite">
        
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: direction > 0 ? 14 : -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction > 0 ? -14 : 14, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute">
            
            {value}
          </motion.span>
        </AnimatePresence>
      </span>

      <motion.button
        type="button"
        aria-label="Increase quantity"
        onClick={() => step(1)}
        whileTap={{ scale: 0.88 }}
        transition={{ duration: 0.14 }}
        className={`flex h-full items-center justify-center rounded-r-lg text-ink-600 transition-colors duration-200 hover:bg-ink-50 hover:text-brand-600 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-ink-800 ${btn}`}
        disabled={value >= max}>
        
        <PlusIcon className="h-3.5 w-3.5" />
      </motion.button>
    </div>);

}