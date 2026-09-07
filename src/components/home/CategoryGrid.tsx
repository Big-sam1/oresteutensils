import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { Category } from '../../types';
import { StaggerGrid, staggerItem } from '../ui/Reveal';

interface CategoryGridProps {
  items: Category[];
  showCount?: boolean;
  columns?: string;
  size?: 'sm' | 'md';
}

export function CategoryGrid({
  items,
  showCount = false,
  columns = 'grid-cols-5',
  size = 'sm'
}: CategoryGridProps) {
  const isSm = size === 'sm';

  return (
    <StaggerGrid className={`grid gap-3 sm:gap-4 md:gap-6 ${columns}`} step={0.06}>
      {items.map((category) =>
      <motion.div key={category.id} variants={staggerItem}>
          <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
          
            <Link
            to={`/shop?category=${encodeURIComponent(category.name)}`}
            className="group flex flex-col items-center gap-1.5 p-1 text-center">
            
              <span
              className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-full transition-all duration-300 group-hover:shadow-card ${
                isSm ? 'w-16 sm:w-20 md:w-24' : 'w-20 sm:w-24 md:w-28'
              }`}
              style={{ backgroundColor: category.tint }}>
              
                <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="h-[76%] w-[76%] rounded-full object-cover transition-transform duration-500 ease-premium group-hover:scale-110" />
              
              </span>
              <span className="text-xs sm:text-[13px] font-semibold text-ink-800 transition-colors duration-200 group-hover:text-brand-600 dark:text-ink-100 dark:group-hover:text-brand-300">
                {category.name}
              </span>
              {showCount &&
            <span className="-mt-1 flex items-center gap-1 text-[11px] text-ink-400">
                  {category.count} Products
                  <ArrowRightIcon className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 ease-premium group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
            }
            </Link>
          </motion.div>
        </motion.div>
      )}
    </StaggerGrid>);

}