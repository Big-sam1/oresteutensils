import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { images } from '../../data/products';
import { Reveal } from '../ui/Reveal';

export function PromoBanner() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], [12, -12]);

  return (
    <Reveal>
      <div
        ref={ref}
        className="relative grid overflow-hidden rounded-2xl bg-cream-100 sm:grid-cols-[1.1fr_1fr] dark:bg-ink-900">
        
        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
            Special Offer
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl dark:text-white">
            Up to 50% Off
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-ink-600 dark:text-ink-300">
            Limited time offer on selected items. Hurry up and grab the best
            deals!
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-5 inline-block">
            
            <Link
              to="/deals"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
              
              Shop the Sale
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
        <motion.img
          src={images.promo}
          alt="Shopping bag with a 50% off tag"
          style={reduce ? undefined : { y }}
          className="h-full w-full object-cover" />
        
      </div>
    </Reveal>);

}