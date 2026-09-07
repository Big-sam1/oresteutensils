import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { Product } from '../types';
import { Modal } from './ui/Modal';
import { StarRating } from './ui/StarRating';
import { AddToCartButton } from './AddToCartButton';
import { QuantitySelector } from './product/QuantitySelector';
import { AnimatedNumber } from './ui/AnimatedNumber';

export function QuickViewModal({
  product,
  onClose



}: {product: Product | null;onClose: () => void;}) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product?.colors[0]?.name ?? '');

  React.useEffect(() => {
    setQuantity(1);
    setColor(product?.colors[0]?.name ?? '');
  }, [product]);

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      label={product ? `Quick view: ${product.name}` : 'Quick view'}>
      
      {product &&
      <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
          <div
          ref={imageRef}
          className="overflow-hidden rounded-xl bg-cream-50 dark:bg-ink-800">
          
            <motion.img
            key={product.id}
            src={product.images[0]}
            alt={product.name}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="aspect-square w-full object-cover" />
          
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              {product.category}
            </p>
            <h2 className="mt-1 text-xl font-bold text-ink-900 dark:text-white">
              {product.name}
            </h2>
            <StarRating
            rating={product.rating}
            reviews={product.reviews}
            className="mt-2" />
          
            <p className="mt-3 text-2xl font-bold text-ink-900 dark:text-white">
              <AnimatedNumber value={product.price * quantity} />
            </p>
            <p className="mt-3 text-sm leading-6 text-ink-500 dark:text-ink-400">
              {product.description}
            </p>

            {product.colors.length > 1 &&
          <div className="mt-4">
                <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">
                  Color: {color}
                </p>
                <div className="mt-2 flex gap-2">
                  {product.colors.map((c) =>
              <button
                key={c.name}
                type="button"
                aria-label={c.name}
                aria-pressed={color === c.name}
                onClick={() => setColor(c.name)}
                className={`h-7 w-7 rounded-full border-2 transition-transform duration-200 ease-premium hover:scale-110 ${
                color === c.name ?
                'border-brand-500' :
                'border-ink-200 dark:border-ink-700'}`
                }
                style={{ backgroundColor: c.hex }} />

              )}
                </div>
              </div>
          }

            <div className="mt-5 flex items-center gap-3">
              <QuantitySelector value={quantity} onChange={setQuantity} />
              <AddToCartButton
              product={product}
              quantity={quantity}
              color={color}
              originRef={imageRef}
              size="md" />
            
            </div>

            <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
            
              View full details
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      }
    </Modal>);

}