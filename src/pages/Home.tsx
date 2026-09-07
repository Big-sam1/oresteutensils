import React, { useState } from 'react';
import { Hero } from '../components/home/Hero';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { SectionHeader } from '../components/SectionHeader';
import { ProductCard } from '../components/ProductCard';
import { ProductCarousel } from '../components/ProductCarousel';
import { PromoBanner } from '../components/home/PromoBanner';
import { Testimonials } from '../components/home/Testimonials';
import { CurvedVideoShowcase } from '../components/home/CurvedVideoShowcase';
import { DealsSlideshow } from '../components/home/DealsSlideshow';
import { QuickViewModal } from '../components/QuickViewModal';
import { StaggerGrid, staggerItem } from '../components/ui/Reveal';
import { motion } from 'framer-motion';
import { categories } from '../data/categories';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

export function Home() {
  const { products } = useStore();
  const [quickView, setQuickView] = useState<Product | null>(null);
  const bestSellers = products.filter((p) => p.bestSeller);
  const dealProducts = products.filter((p) => p.deal);

  return (
    <>
      <Hero />

      <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
        <div className="py-8">
          <ServiceBenefits />
        </div>

        <section className="py-6" aria-labelledby="categories-heading">
          <SectionHeader
            title="Shop by Categories"
            linkLabel="View All Categories"
            to="/categories" />
          
          <span id="categories-heading" className="sr-only">
            Shop by categories
          </span>
          <CategoryGrid items={categories.slice(0, 5)} columns="grid-cols-5" size="sm" />
        </section>

        <section className="py-10" aria-label="Best selling products">
          <SectionHeader
            title="Best Selling Products"
            linkLabel="View All Products"
            to="/shop" />
          
          <StaggerGrid
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
            step={0.08}>
            
            {bestSellers.slice(0, 5).map((product) =>
            <motion.div key={product.id} variants={staggerItem}>
                <ProductCard product={product} onQuickView={setQuickView} />
              </motion.div>
            )}
          </StaggerGrid>
        </section>

        <section className="py-6">
          <PromoBanner />
        </section>

        <section className="py-10" aria-label="Deals of the week">
          <SectionHeader title="Deals of the Week" linkLabel="All Deals" to="/deals" />
          <ProductCarousel
            products={dealProducts}
            onQuickView={setQuickView}
            autoplay />
          
        </section>

        <section className="py-6">
          <DealsSlideshow />
        </section>

        <section className="py-10">
          <Testimonials />
        </section>
      </div>

      {/* Curved 3D Video Showcase matching frame.jpg design after testimonials */}
      <CurvedVideoShowcase />

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </>);

}