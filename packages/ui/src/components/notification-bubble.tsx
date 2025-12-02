/**
 * Notification-Bubble Komponente
 * 
 * Phase 6: In-App-Notification für ungelesene Nachrichten
 * - Sticky Banner oben oder Floating Bubble
 * - Zeigt Anzahl ungelesener Nachrichten
 * - Click-Handler für Navigation
 */

'use client';

import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';

export interface NotificationBubbleProps {
  unreadCount: number;
  onClick?: () => void;
  onDismiss?: () => void;
  variant?: 'banner' | 'floating';
  className?: string;
}

/**
 * Notification-Bubble
 * 
 * Zeigt ungelesene Nachrichten an
 * - variant='banner': Sticky-Banner oben (default)
 * - variant='floating': Floating-Bubble rechts oben
 */
export function NotificationBubble({
  unreadCount,
  onClick,
  onDismiss,
  variant = 'banner',
  className
}: NotificationBubbleProps) {
  if (unreadCount === 0) return null;

  if (variant === 'floating') {
    return (
      <div
        className={cn(
          'fixed top-4 right-4 z-50',
          'bg-cyan-600 text-white rounded-full shadow-lg',
          'px-4 py-3 flex items-center gap-2',
          'cursor-pointer hover:bg-cyan-700 transition-colors',
          'animate-pulse',
          className
        )}
        onClick={onClick}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-semibold">{unreadCount}</span>
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-1 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Banner variant (default)
  return (
    <div
      className={cn(
        'sticky top-0 z-50',
        'bg-gradient-to-r from-cyan-600 to-cyan-700',
        'text-white shadow-md',
        'px-4 py-3',
        'cursor-pointer hover:from-cyan-700 hover:to-cyan-800 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">
            Du hast {unreadCount} neue {unreadCount === 1 ? 'Nachricht' : 'Nachrichten'}
          </span>
        </div>
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
