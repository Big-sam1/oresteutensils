import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, QuoteIcon } from 'lucide-react';
import { testimonials } from '../../data/testimonials';
import { StarRating } from '../ui/StarRating';
import { Reveal } from '../ui/Reveal';

const PER_VIEW = 3;

export function Testimonials() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const pages = Math.ceil(testimonials.length / PER_VIEW);

  const go = useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setIndex((i) => (i + dir + pages) % pages);
    },
    [pages]
  );

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => go(1), 5000);
    return () => window.clearInterval(id);
  }, [paused, reduce, go]);

  const slice = testimonials.slice(index * PER_VIEW, index * PER_VIEW + PER_VIEW);

  return (
    <Reveal className="relative">
      <h2 className="text-center text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-white">
        What Our Customers Say
      </h2>

      <div
        className="relative mt-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        role="region"
        aria-label="Customer testimonials">
        
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: reduce ? 0 : direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : direction * -40 }}
            transition={{ duration: 0.42, ease: [0.23, 1, 0.32, 1] }}
            drag={reduce ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(1);
              if (info.offset.x > 60) go(-1);
            }}
            className="grid cursor-grab gap-4 active:cursor-grabbing sm:grid-cols-2 lg:grid-cols-3">
            
            {slice.map((t) =>
            <figure
              key={t.id}
              className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              
                <QuoteIcon className="h-5 w-5 shrink-0 text-brand-400" />
                <blockquote className="mt-3 flex-1 text-sm leading-6 text-ink-600 dark:text-ink-300">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-ink-100 pt-4 dark:border-ink-800">
                  <img
                  src={t.avatar}
                  alt=""
                  aria-hidden="true"
                  className="h-9 w-9 rounded-full object-cover" />
                
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink-900 dark:text-white">
                      {t.name}
                    </span>
                    <StarRating rating={t.rating} />
                  </span>
                </figcaption>
              </figure>
            )}
          </motion.div>
        </AnimatePresence>

        <NavButton side="left" onClick={() => go(-1)} />
        <NavButton side="right" onClick={() => go(1)} />
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: pages }).map((_, i) =>
        <button
          key={i}
          type="button"
          aria-label={`Go to testimonial page ${i + 1}`}
          aria-current={i === index}
          onClick={() => {
            setDirection(i > index ? 1 : -1);
            setIndex(i);
          }}
          className={`h-1.5 rounded-full transition-all duration-300 ease-premium ${
          i === index ?
          'w-6 bg-brand-500' :
          'w-1.5 bg-ink-300 hover:bg-ink-400 dark:bg-ink-700'}`
          } />

        )}
      </div>
    </Reveal>);

}

function NavButton({
  side,
  onClick



}: {side: 'left' | 'right';onClick: () => void;}) {
  const Icon = side === 'left' ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous testimonials' : 'Next testimonials'}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      className={`absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-card transition-colors duration-200 hover:text-brand-600 sm:flex dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 ${
      side === 'left' ? '-left-4' : '-right-4'}`
      }>
      
      <Icon className="h-5 w-5" />
    </motion.button>);

}