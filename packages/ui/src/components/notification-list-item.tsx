'use client';

/**
 * Notification List Item Component
 * Phase 7: Anzeige einer einzelnen In-App Notification
 */

import { AppNotification } from '@nightlife-os/shared-types';
import { cn } from '../utils/cn';
import { 
  MessageCircle, 
  Users, 
  Radio, 
  BarChart, 
  AlertCircle 
} from 'lucide-react';

interface NotificationListItemProps {
  notification: AppNotification;
  onClick?: () => void;
  className?: string;
}

/**
 * Gibt das passende Icon für den Notification-Typ zurück
 */
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'NEW_DIRECT_MESSAGE':
      return <MessageCircle className="w-5 h-5 text-cyan-400" />;
    case 'NEW_GROUP_MESSAGE':
      return <Users className="w-5 h-5 text-purple-400" />;
    case 'NEW_BROADCAST_MESSAGE':
      return <Radio className="w-5 h-5 text-orange-400" />;
    case 'NEW_POLL':
      return <BarChart className="w-5 h-5 text-green-400" />;
    case 'SYSTEM_ANNOUNCEMENT':
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    default:
      return <MessageCircle className="w-5 h-5 text-gray-400" />;
  }
};

/**
 * Formatiert Timestamp in relativer Zeit
 */
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Gerade eben';
  if (minutes < 60) return `vor ${minutes} Min`;
  if (hours < 24) return `vor ${hours} Std`;
  if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  
  return new Date(timestamp).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export function NotificationListItem({ 
  notification, 
  onClick, 
  className 
}: NotificationListItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer',
        notification.read
          ? 'bg-slate-800/30 border-slate-700/50'
          : 'bg-slate-800/50 border-cyan-500/30 shadow-lg shadow-cyan-500/10',
        'hover:bg-slate-700/50 hover:border-cyan-400/50',
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-white truncate">
            {notification.title}
          </h3>
          {!notification.read && (
            <div className="flex-shrink-0 w-2 h-2 bg-cyan-400 rounded-full mt-1" />
          )}
        </div>
        <p className="text-sm text-slate-300 mt-1 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
