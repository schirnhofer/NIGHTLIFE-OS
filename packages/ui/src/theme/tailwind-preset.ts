/**
 * Tailwind CSS Preset für Nightlife OS
 * 
 * Kann in allen Apps importiert werden:
 * // tailwind.config.ts
 * import { nightlifePreset } from '@nightlife-os/ui/theme/tailwind-preset';
 * export default {
 *   presets: [nightlifePreset],
 *   // ...
 * }
 */

import { colors } from './colors';
import { typography } from './typography';

export const nightlifePreset = {
  theme: {
    extend: {
      colors: {
        // Custom Colors
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
        
        // Background
        'bg-primary': colors.background.primary,
        'bg-secondary': colors.background.secondary,
        'bg-tertiary': colors.background.tertiary,
        
        // Status
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
      },
      
      fontFamily: {
        sans: typography.fontFamily.sans,
        mono: typography.fontFamily.mono,
      },
      
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      
      // Animations
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
};
