import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: {items: Crumb[];}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-400">
        {items.map((item, i) =>
        <li key={item.label} className="flex items-center gap-1">
            {item.to ?
          <Link
            to={item.to}
            className="transition-colors duration-200 hover:text-brand-600 dark:hover:text-brand-200">
            
                {item.label}
              </Link> :

          <span className="font-medium text-ink-600 dark:text-ink-300">
                {item.label}
              </span>
          }
            {i < items.length - 1 && <ChevronRightIcon className="h-3 w-3" />}
          </li>
        )}
      </ol>
    </nav>);

}