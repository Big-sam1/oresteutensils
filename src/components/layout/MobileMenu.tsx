import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { shopCategories } from '../../data/categories';

const links = [
{ label: 'Home', to: '/' },
{ label: 'Shop', to: '/shop' },
{ label: 'Categories', to: '/categories' },
{ label: 'Deals', to: '/deals' },
{ label: 'Cart', to: '/cart' },
{ label: 'Checkout', to: '/checkout' },
{ label: 'Blog', to: '/blog' },
{ label: 'Contact', to: '/contact' }];


export function MobileMenu({
  open,
  onClose



}: {open: boolean;onClose: () => void;}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[70] lg:hidden">
          <motion.div
          className="absolute inset-0 bg-ink-950/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose} />
        
          <motion.aside
          role="dialog"
          aria-label="Navigation"
          className="absolute left-0 top-0 h-full w-[min(20rem,85vw)] overflow-y-auto bg-white p-5 shadow-lift dark:bg-ink-950"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>
          
            <div className="flex items-center justify-between">
              <Link to="/" onClick={onClose} className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Oresteutensils"
                  style={{ borderRadius: '100%' }}
                  className="h-7 w-7 object-cover shadow-sm"
                />
                <span className="text-base font-bold text-ink-900 dark:text-white">
                  Oreste<span className="text-brand-500">utensils</span>
                </span>
              </Link>
              <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="relative h-9 w-9 rounded-lg text-ink-700 transition-colors duration-200 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800">
              
                <span className="absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -rotate-45 rounded-full bg-current" />
              </button>
            </div>

            <div className="mt-4">
              <SearchBar compact />
            </div>

            <nav className="mt-5 flex flex-col" aria-label="Mobile">
              {links.map((link, i) =>
            <motion.div
              key={link.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.08 + i * 0.04,
                duration: 0.32,
                ease: [0.23, 1, 0.32, 1]
              }}>
              
                  <Link
                to={link.to}
                onClick={onClose}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors duration-200 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-ink-800">
                
                    {link.label}
                  </Link>
                </motion.div>
            )}
            </nav>

            <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Shop by category
            </p>
            <div className="mt-2 flex flex-wrap gap-2 px-3">
              {shopCategories.map((c) =>
            <Link
              key={c}
              to={`/shop?category=${encodeURIComponent(c)}`}
              onClick={onClose}
              className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors duration-200 hover:border-brand-400 hover:text-brand-700 dark:border-ink-700 dark:text-ink-300">
              
                  {c}
                </Link>
            )}
            </div>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}