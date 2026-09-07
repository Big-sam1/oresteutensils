import React from 'react';
import { StarIcon } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function StarRating({
  rating,
  reviews,
  size = 'sm',
  className = ''
}: StarRatingProps) {
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) =>
        <StarIcon
          key={i}
          className={`${dim} ${
          i < Math.round(rating) ?
          'fill-amber-400 text-amber-400' :
          'fill-ink-200 text-ink-200 dark:fill-ink-700 dark:text-ink-700'}`
          } />

        )}
      </span>
      <span className="text-xs font-medium text-ink-600 dark:text-ink-300">
        {rating.toFixed(1)}
        {typeof reviews === 'number' &&
        <span className="text-ink-400 dark:text-ink-500"> ({reviews})</span>
        }
      </span>
      <span className="sr-only">
        Rated {rating} out of 5
        {typeof reviews === 'number' ? ` from ${reviews} reviews` : ''}
      </span>
    </div>);

}