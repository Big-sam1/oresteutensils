import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDownIcon,
  LayoutGridIcon,
  ListIcon,
  PackageOpenIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { FilterSidebar, Filters } from '../components/shop/FilterSidebar';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';

const sortOptions = [
'Default sorting',
'Price: low to high',
'Price: high to low',
'Top rated'] as
const;

type Sort = (typeof sortOptions)[number];

const bands: Record<string, [number, number]> = {
  'Under 25,000 FRW': [0, 25000],
  '25,000 – 50,000 FRW': [25000, 50000],
  '50,000 – 100,000 FRW': [50000, 100000],
  '100,000+ FRW': [100000, Infinity]
};

export function Shop() {
  const { products } = useStore();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    category: params.get('category'),
    price: null,
    rating: null,
    color: null
  });
  const [sort, setSort] = useState<Sort>('Default sorting');
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);
    const id = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(id);
  }, [filters, sort]);

  const updateFilters = (next: Filters) => {
    setFilters(next);
    const p = new URLSearchParams(params);
    if (next.category) p.set('category', next.category);else
    p.delete('category');
    setParams(p, { replace: true });
  };

  const results = useMemo(() => {
    let list = products.slice();
    if (filters.category)
    list = list.filter((p) => p.category === filters.category);
    if (filters.price) {
      const [min, max] = bands[filters.price];
      list = list.filter((p) => p.price >= min && p.price < max);
    }
    if (filters.rating)
    list = list.filter((p) => p.rating >= (filters.rating as number));
    if (filters.color)
    list = list.filter((p) =>
    p.colors.some((c) => c.name === filters.color)
    );
    if (sort === 'Price: low to high') list.sort((a, b) => a.price - b.price);
    if (sort === 'Price: high to low') list.sort((a, b) => b.price - a.price);
    if (sort === 'Top rated') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [filters, sort]);

  const totalPages = Math.ceil(results.length / pageSize) || 1;
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return results.slice(start, start + pageSize);
  }, [results, currentPage, pageSize]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Shop' }]} />
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        Shop
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <FilterSidebar
          filters={filters}
          onChange={updateFilters}
          mobileOpen={mobileFilters}
          onCloseMobile={() => setMobileFilters(false)} />
        

        <div>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2.5 dark:border-ink-800 dark:bg-ink-900">
            <button
              type="button"
              onClick={() => setMobileFilters(true)}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-semibold text-ink-700 transition-colors duration-200 hover:border-brand-400 lg:hidden dark:border-ink-700 dark:text-ink-200">
              
              <SlidersHorizontalIcon className="h-3.5 w-3.5" />
              Filters
            </button>

            <p className="text-xs text-ink-500 dark:text-ink-400">
              Showing {results.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, results.length)} of {results.length} results
            </p>

            <div className="ml-auto flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-ink-200 dark:border-ink-700">
                {(['grid', 'list'] as const).map((v) => {
                  const Icon = v === 'grid' ? LayoutGridIcon : ListIcon;
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-label={`${v} view`}
                      aria-pressed={view === v}
                      onClick={() => setView(v)}
                      className={`p-1.5 transition-colors duration-200 ${
                      view === v ?
                      'bg-brand-500 text-white' :
                      'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800'}`
                      }>
                      
                      <Icon className="h-4 w-4" />
                    </button>);

                })}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  aria-expanded={sortOpen}
                  className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition-colors duration-200 hover:border-brand-400 dark:border-ink-700 dark:text-ink-200">
                  
                  {sort}
                  <motion.span
                    animate={{ rotate: sortOpen ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}>
                    
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {sortOpen &&
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute right-0 top-[calc(100%+6px)] z-40 w-48 rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift dark:border-ink-800 dark:bg-ink-900">
                    
                      {sortOptions.map((option) =>
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSort(option);
                        setSortOpen(false);
                      }}
                      className={`block w-full rounded-lg px-2.5 py-2 text-left text-xs transition-colors duration-150 ${
                      sort === option ?
                      'bg-brand-50 font-semibold text-brand-700 dark:bg-ink-800 dark:text-brand-200' :
                      'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800/60'}`
                      }>
                      
                          {option}
                        </button>
                    )}
                    </motion.div>
                  }
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <AnimatePresence mode="wait">
              {loading ?
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}>
                
                  <ProductGridSkeleton count={6} />
                </motion.div> :
              results.length === 0 ?
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink-300 py-16 text-center dark:border-ink-700">
                
                  <PackageOpenIcon className="h-8 w-8 text-ink-300" />
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">
                    No products match these filters
                  </p>
                  <button
                  type="button"
                  onClick={() =>
                  updateFilters({
                    category: null,
                    price: null,
                    rating: null,
                    color: null
                  })
                  }
                  className="mt-1 text-sm font-semibold text-brand-600 dark:text-brand-300">
                  
                    Clear filters
                  </button>
                </motion.div> :

              <motion.div
                key={`${view}-${currentPage}-${sort}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                className={
                view === 'grid' ?
                'grid grid-cols-2 gap-4 sm:grid-cols-3' :
                'grid grid-cols-1 gap-4 sm:grid-cols-2'
                }>
                
                  {paginatedResults.map((product, i) =>
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.42,
                    delay: Math.min(i * 0.08, 0.48),
                    ease: [0.23, 1, 0.32, 1]
                  }}>
                  
                      <ProductCard product={product} onQuickView={setQuickView} />
                    </motion.div>
                )}
                </motion.div>
              }
            </AnimatePresence>

            {/* Shop Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink-100 pt-5 dark:border-ink-800">
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Page <span className="font-bold text-ink-900 dark:text-white">{currentPage}</span> of{' '}
                  <span className="font-bold text-ink-900 dark:text-white">{totalPages}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-[#1a4d2e] text-white shadow-xs'
                          : 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <ServiceBenefits />
      </div>

      <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />
    </div>);

}