import React from 'react';
import { motion } from 'framer-motion';
import {
  TruckIcon,
  ShieldCheckIcon,
  RefreshCwIcon,
  HeadphonesIcon } from
'lucide-react';
import { StaggerGrid, staggerItem } from '../ui/Reveal';

const benefits = [
{
  icon: TruckIcon,
  title: 'Free Shipping',
  copy: 'On orders over 50,000 FRW'
},
{
  icon: ShieldCheckIcon,
  title: 'Secure Payment',
  copy: '100% secure payment'
},
{
  icon: RefreshCwIcon,
  title: 'Easy Returns',
  copy: '30 days return policy'
},
{
  icon: HeadphonesIcon,
  title: '24/7 Support',
  copy: 'Dedicated support'
}];


export function ServiceBenefits({ className = '' }: {className?: string;}) {
  return (
    <StaggerGrid
      className={`grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ink-200 bg-ink-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-ink-800 dark:bg-ink-800 ${className}`}
      step={0.07}>
      
      {benefits.map(({ icon: Icon, title, copy }) =>
      <motion.div
        key={title}
        variants={staggerItem}
        className="group flex items-center gap-3 bg-white px-4 py-4 dark:bg-ink-900">
        
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 text-brand-600 transition-colors duration-300 group-hover:border-brand-300 group-hover:bg-brand-50 dark:border-ink-700 dark:text-brand-300 dark:group-hover:bg-ink-800">
            <Icon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:scale-110" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink-900 dark:text-white">
              {title}
            </span>
            <span className="block text-xs text-ink-500 dark:text-ink-400">
              {copy}
            </span>
          </span>
        </motion.div>
      )}
    </StaggerGrid>);

}