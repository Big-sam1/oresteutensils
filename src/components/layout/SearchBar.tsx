import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import { currency } from '../../utils/format';
import { useStore } from '../../contexts/StoreContext';

export function SearchBar({ compact = false }: {compact?: boolean;}) {
  const { products } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<number>();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.
    filter(
      (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    ).
    slice(0, 5);
  }, [query]);

  const open = focused && query.trim().length > 0;

  const go = (slug: string) => {
    setQuery('');
    setFocused(false);
    navigate(`/product/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].slug);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  return (
    <div className="relative w-full">
      <motion.div
        animate={{
          scale: focused ? 1.015 : 1,
          borderColor: focused ? '#6b7f4a' : 'rgba(0,0,0,0)'
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className={`flex items-center gap-2 rounded-lg border bg-ink-50 dark:bg-ink-800/70 ${
        compact ? 'px-3 py-2' : 'px-3.5 py-2.5'}`
        }
        style={{ boxShadow: focused ? '0 0 0 3px rgba(107,127,74,0.14)' : 'none' }}>
        
        <input
          id={compact ? 'compact-product-search' : 'product-search'}
          name="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onFocus={() => {
            window.clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => setFocused(false), 120);
          }}
          onKeyDown={onKeyDown}
          type="search"
          placeholder="Search for products..."
          aria-label="Search for products"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 outline-none placeholder:text-ink-400 dark:text-ink-100" />
        
        <motion.span
          animate={{ scale: focused ? 1.1 : 1, rotate: focused ? -8 : 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="text-ink-500 dark:text-ink-300">
          
          <SearchIcon className="h-4 w-4" />
        </motion.span>
      </motion.div>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift dark:border-ink-800 dark:bg-ink-900">
          
            {results.length > 0 ?
          <ul role="listbox" aria-label="Search suggestions">
                {results.map((p, i) =>
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}>
              
                    <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(p.slug)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-150 ${
                i === active ?
                'bg-brand-50 dark:bg-ink-800' :
                'hover:bg-ink-50 dark:hover:bg-ink-800/60'}`
                }>
                
                      <img
                  src={p.images[0]}
                  alt=""
                  className="h-9 w-9 rounded-md object-cover" />
                
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink-800 dark:text-ink-100">
                          {p.name}
                        </span>
                        <span className="block text-xs text-ink-400">
                          {p.category}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-brand-600 dark:text-brand-300">
                        {currency(p.price)}
                      </span>
                    </button>
                  </motion.li>
            )}
              </ul> :

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col items-center gap-1.5 px-4 py-6 text-center">
            
                <SearchXIcon className="h-6 w-6 text-ink-300" />
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  No results for “{query}”
                </p>
                <p className="text-xs text-ink-400">
                  Try a different keyword or browse all products.
                </p>
              </motion.div>
          }
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}