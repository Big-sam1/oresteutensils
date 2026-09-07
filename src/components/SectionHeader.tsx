import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
import { Reveal } from './ui/Reveal';

export function SectionHeader({
  title,
  linkLabel,
  to




}: {title: string;linkLabel?: string;to?: string;}) {
  return (
    <Reveal className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xl font-bold tracking-tight text-ink-900 sm:text-2xl dark:text-white">
        {title}
      </h2>
      {linkLabel && to &&
      <Link
        to={to}
        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
        
          <span className="relative">
            {linkLabel}
            <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand-500 transition-transform duration-300 ease-premium group-hover:scale-x-100" />
          </span>
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 ease-premium group-hover:translate-x-1" />
        </Link>
      }
    </Reveal>);

}