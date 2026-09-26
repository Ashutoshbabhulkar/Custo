'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  value?: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: '😞 Poor',
  2: '😕 Average',
  3: '🙂 Good',
  4: '😊 Very Good',
  5: '😍 Excellent!',
};

export const RatingStars: React.FC<RatingStarsProps> = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'lg',
  showLabel = true,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const handleMouseEnter = (star: number) => {
    if (!readOnly) setHoverValue(star);
  };

  const handleMouseLeave = () => {
    if (!readOnly) setHoverValue(null);
  };

  const handleClick = (star: number) => {
    if (!readOnly && onChange) {
      onChange(star);
    }
  };

  return (
    <div className={clsx('flex flex-col items-center gap-3', className)}>
      <div
        className="flex items-center gap-2"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeValue;

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              className={clsx(
                'transition-all duration-200 focus:outline-none',
                readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-115 active:scale-95'
              )}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={clsx(
                  starSizes[size],
                  'transition-all duration-200',
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)] scale-105'
                    : 'fill-gray-100 text-gray-300'
                )}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <div className="h-7 flex items-center justify-center">
          <span
            className={clsx(
              'text-sm font-semibold transition-all duration-200 animate-fade-in',
              activeValue > 0 ? 'text-[#005A63]' : 'text-gray-400'
            )}
          >
            {activeValue > 0 ? RATING_LABELS[activeValue] : 'Tap a star to rate'}
          </span>
        </div>
      )}
    </div>
  );
};
