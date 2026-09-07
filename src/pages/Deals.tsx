import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { DealsSlideshow } from '../components/home/DealsSlideshow';
import { SectionHeader } from '../components/SectionHeader';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductCarousel } from '../components/ProductCarousel';
import { StaggerGrid, staggerItem } from '../components/ui/Reveal';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

export function Deals() {
  const { products } = useStore();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const deals = products.filter((p) => p.deal);
  const trending = products.filter((p) => p.bestSeller);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Deals' }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        Deals
      </h1>

      <div className="mt-6">
        <DealsSlideshow />
      </div>

      <section className="py-10" aria-label="Discounted products">
        <SectionHeader title="On Sale Now" linkLabel="Shop all" to="/shop" />
        <StaggerGrid
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          step={0.08}>
          
          {deals.map((product) =>
          <motion.div key={product.id} variants={staggerItem}>
              <ProductCard product={product} onQuickView={setQuickView} />
            </motion.div>
          )}
        </StaggerGrid>
      </section>

      <section className="pb-6" aria-label="Trending products">
        <SectionHeader title="Trending This Week" />
        <ProductCarousel products={trending} onQuickView={setQuickView} />
      </section>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>);

}