/**
 * QR-Code-Display-Komponente
 * 
 * Platzhalter für spätere Integration mit QRCode.js
 */

import React from 'react';
import { cn } from '../utils/cn';

export interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 200,
  className,
}) => {
  // TODO: Später mit QRCode.js implementieren
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-white rounded-lg',
        className
      )}
      style={{ width: size, height: size }}
    >
      <p className="text-slate-900 text-xs text-center px-4">
        QR-Code: {value}
      </p>
    </div>
  );
};
