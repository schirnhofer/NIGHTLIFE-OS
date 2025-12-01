'use client'

import React from 'react'

export interface LoadingProps {
  fullScreen?: boolean
  text?: string
}

export const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = false, 
  text = 'Laden...' 
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 flex flex-col items-center justify-center bg-slate-950'
    : 'flex flex-col items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      <div className="w-12 h-12 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
      {text && (
        <p className="mt-4 text-slate-400 text-sm">{text}</p>
      )}
    </div>
  )
}
