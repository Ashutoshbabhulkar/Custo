import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variants = {
    default: 'bg-white rounded-3xl shadow-card border border-gray-100/80',
    glass: 'glass-panel rounded-3xl shadow-glass',
    bordered: 'bg-white rounded-3xl border-2 border-gray-200',
  };

  return (
    <div
      className={clsx(variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
};
