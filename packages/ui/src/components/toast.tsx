/**
 * Toast-Komponente
 * 
 * Einfache Toast-Notification (ohne externe Library)
 */

import React, { useEffect, useState } from 'react';
import { cn } from '../utils/cn';
import { Check, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // ms
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: <Check className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg p-4 shadow-lg',
        'min-w-[300px] max-w-md',
        {
          'bg-green-600 text-white': type === 'success',
          'bg-red-600 text-white': type === 'error',
          'bg-cyan-600 text-white': type === 'info',
        }
      )}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="text-white/80 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
