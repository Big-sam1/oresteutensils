import React from 'react';

export function Skeleton({ className = '' }: {className?: string;}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-ink-100 dark:bg-ink-800 ${className}`}
      aria-hidden="true">
      
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/10" />
    </div>);

}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-ink-200 bg-white p-3 dark:border-ink-800 dark:bg-ink-900">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="mt-3 h-3.5 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
      <Skeleton className="mt-3 h-3.5 w-1/3" />
      <Skeleton className="mt-3 h-9 w-full rounded-lg" />
    </div>);

}

export function ProductGridSkeleton({ count = 8 }: {count?: number;}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) =>
      <ProductCardSkeleton key={i} />
      )}
    </div>);

}

export function DetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-11 w-48 rounded-lg" />
      </div>
    </div>);

}