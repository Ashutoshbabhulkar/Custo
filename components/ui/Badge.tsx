import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variants = {
    primary: 'bg-[#D1ECF1] text-[#005A63] border border-[#005A63]/15',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-200',
    accent: 'bg-red-50 text-red-600 border border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    outline: 'border border-gray-300 text-gray-600 bg-transparent',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs font-medium rounded-full',
    md: 'px-3.5 py-1.5 text-xs font-semibold rounded-full',
  };

  return (
    <span
      className={clsx('inline-flex items-center gap-1.5', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
