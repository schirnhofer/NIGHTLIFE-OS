'use client'

import React from 'react'
import { ICON_PATHS } from './icon-paths'

export interface IconProps {
  name: string
  size?: number
  className?: string
  onClick?: () => void
}

/**
 * Icon-Komponente mit hardcoded SVG-Pfaden
 * Keine externen Dependencies
 */
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  onClick 
}) => {
  const path = ICON_PATHS[name] || ''

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      dangerouslySetInnerHTML={{ __html: path }}
    />
  )
}
