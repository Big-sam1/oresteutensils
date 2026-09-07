import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { avatars } from '../../data/testimonials';

const ease = [0.23, 1, 0.32, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 10, y: py * 10 });
  };

  const step = (i: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay: reduce ? 0 : i, ease }
  });

  const sentences = [
    'Premium Tools for Every Kitchen',
    'Deliciousness Starts With The Right Tools',
    'Presentation That Makes Every Taste Different',
  ];

  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = sentences[textIndex];
    let timer: number;

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timer = window.setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timer = window.setTimeout(() => setIsDeleting(true), 2400);
      }
    } else {
      if (displayText.length > 0) {
        timer = window.setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length - 1));
        }, 40);
      } else {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % sentences.length);
      }
    }

    return () => window.clearTimeout(timer);
  }, [displayText, isDeleting, textIndex]);

  const heroImages = [
    new URL('../images/orest1.png', import.meta.url).href,
    new URL('../images/orest2.png', import.meta.url).href,
    new URL('../images/oreste utensils 3.png', import.meta.url).href,
    new URL('../images/oreste utensils 4.png', import.meta.url).href,
  ];

  const [heroImageIdx, setHeroImageIdx] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroImageIdx((prev) => (prev + 1) % heroImages.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  return (
    <section
      ref={frameRef}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      className="relative overflow-hidden bg-cream-100 dark:bg-ink-900"
      aria-labelledby="hero-heading">
      
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8 lg:py-16">
        <div>
          <motion.span
            {...step(0.1)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 shadow-sm dark:bg-brand-950/40 dark:text-brand-300">
            
            <SparklesIcon className="h-3 w-3 text-brand-500" />
            Oresteutensils Collection
          </motion.span>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 26, letterSpacing: '0.01em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.2, ease }}
            className="mt-4 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px] max-w-xl text-4xl font-extrabold leading-[1.08] text-ink-900 sm:text-5xl lg:text-[3.2rem] dark:text-white">
            
            <span>{displayText}</span>
            <span className="inline-block w-1.5 h-[0.9em] bg-brand-500 ml-1.5 align-baseline animate-pulse rounded-full" />
          </motion.h1>

          <motion.p
            {...step(0.35)}
            className="mt-3 max-w-lg text-[15px] leading-7 text-ink-700 font-medium dark:text-ink-200">
            
            <span className="text-brand-600 font-semibold dark:text-brand-400">“</span>Deliciousness starts with the right tools, and presentation at the table is what makes every taste different.<span className="text-brand-600 font-semibold dark:text-brand-400">”</span>
          </motion.p>

          <motion.p
            {...step(0.4)}
            className="mt-2 max-w-md text-xs leading-5 text-ink-500 dark:text-ink-400">
            
            Discover chef-grade cookware, precision cutlery, non-stick bakeware, and artistic dinnerware designed for extraordinary culinary moments.
          </motion.p>

          <motion.div {...step(0.5)} className="mt-6 flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/shop"
                className="group inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
                
                Shop Kitchen Tools
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/deals"
                className="inline-flex h-11 items-center rounded-lg border border-ink-300 bg-white/70 px-5 text-sm font-semibold text-ink-800 transition-colors duration-200 hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-100">
                
                Explore Deals
              </Link>
            </motion.div>
          </motion.div>

          <motion.div {...step(0.65)} className="mt-7 flex items-center gap-3">
            <div className="flex">
              {avatars.map((src, i) =>
              <motion.img
                key={src}
                src={src}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.7, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduce ? 0 : 0.65 + i * 0.08,
                  ease
                }}
                className="-ml-2 h-8 w-8 rounded-full border-2 border-white object-cover first:ml-0 dark:border-ink-900" />

              )}
            </div>
            <p className="text-xs font-medium text-ink-600 dark:text-ink-300">
              Trusted by 10,000+ Home Chefs
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 34, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.75, ease }}
          className="relative min-w-0">
          
          <motion.div
            animate={{ x: tilt.x, y: tilt.y }}
            transition={{ type: 'spring', stiffness: 90, damping: 18 }}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-50 shadow-card dark:bg-ink-800">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={heroImageIdx}
                src={heroImages[heroImageIdx]}
                alt="Oresteutensils culinary collection"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 h-full w-full object-cover" />
            </AnimatePresence>

            {/* Pagination indicator dots */}
            <div className="absolute bottom-3.5 right-3.5 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setHeroImageIdx(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === heroImageIdx ? 'w-4 bg-brand-500' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>);

}