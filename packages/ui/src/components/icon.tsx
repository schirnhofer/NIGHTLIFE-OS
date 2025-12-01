/**
 * Icon-Wrapper (Lucide React)
 */

import React from 'react';
import { LucideProps } from 'lucide-react';
import { cn } from '../utils/cn';

export interface IconProps extends LucideProps {
  icon: React.ComponentType<LucideProps>;
}

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, className, ...props }) => {
  return <IconComponent className={cn('h-5 w-5', className)} {...props} />;
};

// Re-export häufig verwendete Icons
export {
  Home,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,
  QrCode,
  Music,
  Lightbulb,
  Bell,
  Menu,
} from 'lucide-react';
