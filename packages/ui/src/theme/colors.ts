/**
 * Nightlife OS - Farbschema
 * 
 * Dunkles Theme mit Cyan als Akzentfarbe
 */

export const colors = {
  // Basis-Farben
  primary: '#00ffff', // Cyan
  secondary: '#0891b2', // Cyan-700
  accent: '#06b6d4', // Cyan-500
  
  // Hintergrund (Dunkel)
  background: {
    primary: '#0f172a', // Slate-900
    secondary: '#1e293b', // Slate-800
    tertiary: '#334155', // Slate-700
  },
  
  // Text
  text: {
    primary: '#f1f5f9', // Slate-100
    secondary: '#cbd5e1', // Slate-300
    muted: '#64748b', // Slate-500
  },
  
  // Status-Farben
  success: '#10b981', // Green-500
  warning: '#f59e0b', // Amber-500
  error: '#ef4444', // Red-500
  info: '#3b82f6', // Blue-500
  
  // Trust-Levels
  trust: {
    veryHigh: '#10b981', // Green
    high: '#3b82f6', // Blue
    medium: '#f59e0b', // Amber
    low: '#f97316', // Orange
    veryLow: '#ef4444', // Red
  },
} as const;

export type ColorKey = keyof typeof colors;
