import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string;
  size?: 'md' | 'lg' | 'full';
  bare?: boolean;
}

const widths = {
  md: 'max-w-md',
  lg: 'max-w-3xl',
  full: 'max-w-6xl'
};

export function Modal({
  open,
  onClose,
  children,
  label,
  size = 'lg',
  bare = false
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
          className="absolute inset-0 bg-ink-950/70 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose} />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={`relative w-full ${widths[size]} ${
          bare ?
          '' :
          'overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-900'}`
          }
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}>
          
            <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="group absolute right-3 top-3 z-10 rounded-full border border-ink-200 bg-white/90 p-1.5 text-ink-600 transition-colors duration-200 hover:border-ink-300 hover:text-ink-900 dark:border-ink-700 dark:bg-ink-900/90 dark:text-ink-200">
            
              <XIcon className="h-4 w-4 transition-transform duration-200 ease-premium group-hover:rotate-90" />
            </button>
            {children}
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}