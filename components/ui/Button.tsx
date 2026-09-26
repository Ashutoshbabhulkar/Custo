import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-[#005A63] hover:bg-[#00484F] text-white shadow-md hover:shadow-lg focus:ring-[#005A63]',
    secondary: 'bg-[#D1ECF1] hover:bg-[#bce3eb] text-[#005A63] border border-[#005A63]/10 focus:ring-[#005A63]',
    accent: 'bg-[#EA1B23] hover:bg-[#d4151c] text-white shadow-md hover:shadow-lg focus:ring-[#EA1B23]',
    outline: 'border-2 border-[#005A63] text-[#005A63] hover:bg-[#005A63] hover:text-white focus:ring-[#005A63]',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
