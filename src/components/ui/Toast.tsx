import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, InfoIcon, XIcon, AlertTriangleIcon } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { ToastVariant } from '../../types';

const icons: Record<ToastVariant, React.ElementType> = {
  success: CheckIcon,
  error: AlertTriangleIcon,
  info: InfoIcon
};

const accents: Record<ToastVariant, string> = {
  success: 'bg-brand-500',
  error: 'bg-red-500',
  info: 'bg-ink-500'
};

export function ToastViewport() {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      className="pointer-events-none fixed bottom-5 right-4 z-[90] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2"
      role="status"
      aria-live="polite">
      
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              className="pointer-events-auto overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lift dark:border-ink-800 dark:bg-ink-900">
              
              <div className="flex items-start gap-3 px-3.5 py-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${accents[toast.variant]}`}>
                  
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <p className="flex-1 text-sm font-medium leading-5 text-ink-800 dark:text-ink-100">
                  {toast.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="group -mr-1 -mt-1 rounded-md p-1 text-ink-400 transition-colors duration-200 hover:text-ink-700 dark:hover:text-ink-100">
                  
                  <XIcon className="h-4 w-4 transition-transform duration-200 ease-premium group-hover:rotate-90" />
                </button>
              </div>
              <motion.div
                className={`h-0.5 origin-left ${accents[toast.variant]}`}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3.6, ease: 'linear' }} />
              
            </motion.div>);

        })}
      </AnimatePresence>
    </div>);

}