'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Icon } from '@nightlife/ui'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  errorMsg: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.toString() }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL APP ERROR:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <Icon name="x" size={64} className="text-red-500 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Kritischer Fehler
            </h1>
            <p className="text-slate-400 mb-2">
              Die Anwendung ist auf einen Fehler gestoßen.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <p className="text-xs text-red-400 font-mono break-all">
                {this.state.errorMsg}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-all"
            >
              App neu laden
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
