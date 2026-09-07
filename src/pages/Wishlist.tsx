import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartIcon } from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';

export function Wishlist() {
  const { wishlist, products } = useStore();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        Wishlist
      </h1>

      {items.length === 0 ?
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-300 py-20 text-center dark:border-ink-700">
        
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-100 text-red-500 dark:bg-ink-800">
            <HeartIcon className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-bold text-ink-900 dark:text-white">
            Nothing saved yet
          </h2>
          <p className="max-w-xs text-sm text-ink-500 dark:text-ink-400">
            Tap the heart on any product to keep it here for later.
          </p>
          <Link
          to="/shop"
          className="mt-2 inline-flex h-11 items-center rounded-lg bg-brand-500 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-600">
          
            Browse Products
          </Link>
        </motion.div> :

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <AnimatePresence>
            {items.map((product) =>
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}>
            
                <ProductCard product={product} onQuickView={setQuickView} />
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      }

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>);

}