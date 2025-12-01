/**
 * Loader-Komponente
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
  return (
    <Loader2
      className={cn(
        'animate-spin text-cyan-500',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    />
  );
};

export const LoaderFullscreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
      <Loader size="lg" />
    </div>
  );
};
