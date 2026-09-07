import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { deals } from '../../data/deals';
import { Reveal } from '../ui/Reveal';

export function DealsSlideshow() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta: 1 | -1) => {
    setDir(delta);
    setIndex((i) => (i + delta + deals.length) % deals.length);
  }, []);

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => go(1), 5200);
    return () => window.clearInterval(id);
  }, [paused, reduce, go]);

  const deal = deals[index];

  return (
    <Reveal>
      <div
        className="relative overflow-hidden rounded-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        role="region"
        aria-label="Promotional offers"
        aria-roledescription="carousel">
        
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, x: reduce ? 0 : dir * 60, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: reduce ? 0 : dir * -60, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="grid sm:grid-cols-[1.1fr_1fr]"
            style={{ backgroundColor: deal.tint }}>
            
            <div className="px-6 py-9 sm:px-9">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                {deal.eyebrow}
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
                {deal.title}
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-ink-600">
                {deal.copy}
              </p>
              <Link
                to={deal.href}
                className="group mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
                
                {deal.cta}
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </Link>
            </div>
            <img
              src={deal.image}
              alt={deal.title}
              className="h-52 w-full object-cover sm:h-full" />
            
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-6 flex items-center gap-2 sm:left-9">
          {deals.map((d, i) =>
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setDir(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Show offer ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ease-premium ${
            i === index ? 'w-6 bg-brand-600' : 'w-1.5 bg-ink-900/25'}`
            } />

          )}
        </div>

        <div className="absolute right-4 top-4 flex gap-2">
          {([-1, 1] as const).map((d) => {
            const Icon = d === -1 ? ChevronLeftIcon : ChevronRightIcon;
            return (
              <motion.button
                key={d}
                type="button"
                onClick={() => go(d)}
                aria-label={d === -1 ? 'Previous offer' : 'Next offer'}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-ink-700 shadow-sm transition-colors duration-200 hover:text-brand-600">
                
                <Icon className="h-4 w-4" />
              </motion.button>);

          })}
        </div>
      </div>
    </Reveal>);

}