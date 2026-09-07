import React from 'react';
import { useStore } from '../../contexts/StoreContext';
import { AnimatePresence, motion } from 'framer-motion';
import { StarIcon, XIcon } from 'lucide-react';
import { shopCategories } from '../../data/categories';

export interface Filters {
  category: string | null;
  price: string | null;
  rating: number | null;
  color: string | null;
}

const priceBands = [
  'Under 25,000 FRW',
  '25,000 – 50,000 FRW',
  '50,000 – 100,000 FRW',
  '100,000+ FRW'
];

const swatches = [
  { name: 'Black', hex: '#1b1b1b' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Red', hex: '#c0392b' },
  { name: 'Teal', hex: '#1abc9c' },
  { name: 'Sage', hex: '#8faf8f' },
  { name: 'Cream', hex: '#f5f0e8' },
  { name: 'Graphite', hex: '#4a4a4a' },
];


interface FilterSidebarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function FilterSidebar({
  filters,
  onChange,
  mobileOpen,
  onCloseMobile
}: FilterSidebarProps) {
  const panel = <FilterPanel filters={filters} onChange={onChange} />;

  return (
    <>
      <aside className="hidden lg:block" aria-label="Product filters">
        <div className="sticky top-32 rounded-xl border border-ink-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-900">
          {panel}
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen &&
        <div className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
            className="absolute inset-0 bg-ink-950/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onCloseMobile} />
          
            <motion.aside
            role="dialog"
            aria-label="Product filters"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 top-0 h-full w-[min(20rem,88vw)] overflow-y-auto bg-white p-5 dark:bg-ink-950">
            
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base font-bold text-ink-900 dark:text-white">
                  Filters
                </span>
                <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close filters"
                className="group rounded-lg p-1.5 text-ink-600 transition-colors duration-200 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800">
                
                  <XIcon className="h-5 w-5 transition-transform duration-200 ease-premium group-hover:rotate-90" />
                </button>
              </div>
              {panel}
            </motion.aside>
          </div>
        }
      </AnimatePresence>
    </>);

}

function FilterPanel({
  filters,
  onChange



}: {filters: Filters;onChange: (next: Filters) => void;}) {
  const { products } = useStore();
  const counts = shopCategories.map((c) => ({
    name: c,
    count: products.filter((p) => p.category === c).length
  }));

  return (
    <div className="space-y-6">
      <Group title="Categories">
        <ul className="space-y-1">
          {counts.map((c) =>
          <li key={c.name}>
              <button
              type="button"
              onClick={() =>
              onChange({
                ...filters,
                category: filters.category === c.name ? null : c.name
              })
              }
              aria-pressed={filters.category === c.name}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors duration-200 ${
              filters.category === c.name ?
              'bg-brand-50 font-semibold text-brand-700 dark:bg-ink-800 dark:text-brand-200' :
              'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800/60'}`
              }>
              
                <span>{c.name}</span>
                <span className="text-xs text-ink-400">
                  ({String(c.count).padStart(2, '0')})
                </span>
              </button>
            </li>
          )}
        </ul>
      </Group>

      <Group title="Price Range">
        <ul className="space-y-1">
          {priceBands.map((band) =>
          <li key={band}>
              <button
              type="button"
              onClick={() =>
              onChange({
                ...filters,
                price: filters.price === band ? null : band
              })
              }
              aria-pressed={filters.price === band}
              className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition-colors duration-200 ${
              filters.price === band ?
              'bg-brand-50 font-semibold text-brand-700 dark:bg-ink-800 dark:text-brand-200' :
              'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800/60'}`
              }>
              
                {band}
              </button>
            </li>
          )}
        </ul>
      </Group>

      <Group title="Ratings">
        <ul className="space-y-1">
          {[4, 3, 2].map((r) =>
          <li key={r}>
              <button
              type="button"
              onClick={() =>
              onChange({ ...filters, rating: filters.rating === r ? null : r })
              }
              aria-pressed={filters.rating === r}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors duration-200 ${
              filters.rating === r ?
              'bg-brand-50 text-brand-700 dark:bg-ink-800' :
              'text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800/60'}`
              }>
              
                <span className="flex" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) =>
                <StarIcon
                  key={i}
                  className={`h-3.5 w-3.5 ${
                  i < r ?
                  'fill-amber-400 text-amber-400' :
                  'fill-ink-200 text-ink-200 dark:fill-ink-700 dark:text-ink-700'}`
                  } />

                )}
                </span>
                <span className="text-xs">& up</span>
              </button>
            </li>
          )}
        </ul>
      </Group>

      <Group title="Color">
        <div className="flex flex-wrap gap-2">
          {swatches.map((s) =>
          <button
            key={s.name}
            type="button"
            aria-label={s.name}
            aria-pressed={filters.color === s.name}
            onClick={() =>
            onChange({
              ...filters,
              color: filters.color === s.name ? null : s.name
            })
            }
            className={`h-6 w-6 rounded-full border-2 transition-transform duration-200 ease-premium hover:scale-110 ${
            filters.color === s.name ?
            'border-brand-500 scale-110' :
            'border-ink-200 dark:border-ink-700'}`
            }
            style={{ backgroundColor: s.hex }} />

          )}
        </div>
      </Group>

      <button
        type="button"
        onClick={() =>
        onChange({ category: null, price: null, rating: null, color: null })
        }
        className="w-full rounded-lg border border-ink-200 py-2 text-sm font-semibold text-ink-700 transition-colors duration-200 hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200">
        
        Clear all filters
      </button>
    </div>);

}

function Group({
  title,
  children



}: {title: string;children: React.ReactNode;}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-ink-900 dark:text-white">
        {title}
      </h3>
      {children}
    </div>);

}