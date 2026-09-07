import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  products: Product[];
  onQuickView?: (product: Product) => void;
  autoplay?: boolean;
}

/**
 * Native scroll-snap track (GPU-friendly, no JS animation loop) with
 * animated arrows, drag/swipe, keyboard support and optional autoplay.
 */
export function ProductCarousel({
  products,
  onQuickView,
  autoplay = false
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [paused, setPaused] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    sync();
  }, [sync, products]);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('[data-card]') as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: amount * dir, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!autoplay || paused) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollBy(1);
      }
    }, 4200);
    return () => window.clearInterval(id);
  }, [autoplay, paused, scrollBy]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      
      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="region"
        aria-label="Product carousel"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') scrollBy(1);
          if (e.key === 'ArrowLeft') scrollBy(-1);
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2">
        
        {products.map((product) =>
        <div
          key={product.id}
          data-card
          className="w-[min(72vw,236px)] shrink-0 snap-start">
          
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        )}
      </div>

      <CarouselArrow
        side="left"
        disabled={atStart}
        onClick={() => scrollBy(-1)} />
      
      <CarouselArrow side="right" disabled={atEnd} onClick={() => scrollBy(1)} />
    </div>);

}

function CarouselArrow({
  side,
  disabled,
  onClick




}: {side: 'left' | 'right';disabled: boolean;onClick: () => void;}) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous products' : 'Next products'}
      animate={{ opacity: disabled ? 0 : 1, scale: disabled ? 0.9 : 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-card transition-colors duration-200 hover:text-brand-600 sm:flex dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 z-10 ${
      side === 'left' ? 'left-1 sm:-left-2' : 'right-1 sm:-right-2'}`
      }>
      
      <Icon className="h-5 w-5" />
    </motion.button>);

}