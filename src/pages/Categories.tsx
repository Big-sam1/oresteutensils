import React from 'react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { ServiceBenefits } from '../components/layout/ServiceBenefits';
import { categories } from '../data/categories';

export function Categories() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <Breadcrumbs
        items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
      
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        All Categories
      </h1>
      <p className="mt-2 max-w-lg text-sm text-ink-500 dark:text-ink-400">
        Browse the full catalogue by department — every category is curated and
        restocked weekly.
      </p>

      <div className="mt-8">
        <CategoryGrid items={categories} showCount />
      </div>

      <div className="mt-12">
        <ServiceBenefits />
      </div>
    </div>);

}