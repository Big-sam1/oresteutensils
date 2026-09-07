import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { EyeIcon } from 'lucide-react';
import { Product } from '../types';
import { StarRating } from './ui/StarRating';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';
import { currency } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const secondary = product.images[1];

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onTouchStart={() => setHovered((h) => !h)}
      animate={
      reduce ?
      undefined :
      {
        y: hovered ? -4 : 0,
        boxShadow: hovered ?
        '0 8px 16px -6px rgba(23,26,22,0.10), 0 24px 48px -20px rgba(23,26,22,0.22)' :
        '0 1px 2px rgba(23,26,22,0.04), 0 8px 24px -12px rgba(23,26,22,0.10)'
      }
      }
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className="group flex h-full flex-col rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
      
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-lg bg-cream-50 dark:bg-ink-800">
        
        <Link
          to={`/product/${product.slug}`}
          aria-label={product.name}
          className="block">
          
          <div className="relative aspect-square w-full">
            <motion.img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              animate={
              reduce ?
              undefined :
              {
                scale: hovered ? 1.06 : 1,
                x: hovered ? -4 : 0,
                opacity: hovered && secondary ? 0 : 1
              }
              }
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} />
            
            {secondary &&
            <motion.img
              src={secondary}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ opacity: 0 }}
              animate={
              reduce ?
              undefined :
              { opacity: hovered ? 1 : 0, scale: hovered ? 1.04 : 1 }
              }
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} />

            }
          </div>
        </Link>

        <div className="absolute right-2 top-2 flex flex-col gap-1.5">
          <motion.div
            animate={{ opacity: hovered || reduce ? 1 : 0.85, y: hovered ? 0 : -2 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
            
            <WishlistButton product={product} />
          </motion.div>
          {onQuickView &&
          <motion.button
            type="button"
            onClick={() => onQuickView(product)}
            aria-label={`Quick view ${product.name}`}
            initial={false}
            animate={{
              opacity: hovered ? 1 : 0,
              y: hovered ? 0 : -6,
              pointerEvents: hovered ? 'auto' : 'none'
            }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-200 bg-white/95 text-ink-600 shadow-sm transition-colors duration-200 hover:text-brand-600 dark:border-ink-700 dark:bg-ink-900/95 dark:text-ink-200">
            
              <EyeIcon className="h-4 w-4" />
            </motion.button>
          }
        </div>

        {product.oldPrice &&
        <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-bold text-white">
            -
            {Math.round(
            (product.oldPrice - product.price) / product.oldPrice * 100
          )}
            %
          </span>
        }
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3 className="text-sm font-semibold leading-5 text-ink-900 dark:text-white">
          <Link
            to={`/product/${product.slug}`}
            className="transition-colors duration-200 hover:text-brand-600 dark:hover:text-brand-200">
            
            {product.name}
          </Link>
        </h3>
        <StarRating
          rating={product.rating}
          reviews={product.reviews}
          className="mt-1.5" />
        
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[15px] font-bold text-ink-900 dark:text-white">
            {currency(product.price)}
          </span>
          {product.oldPrice &&
          <span className="text-xs text-ink-400 line-through">
              {currency(product.oldPrice)}
            </span>
          }
        </p>
        <div className="mt-auto pt-3">
          <AddToCartButton product={product} originRef={imageRef} />
        </div>
      </div>
    </motion.article>);

}