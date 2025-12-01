'use client'

import { Icon } from '@nightlife/ui'
import { useTranslation } from '@nightlife/ui'

interface TabNavigationProps {
  activeTab: 'home' | 'chat'
  setActiveTab: (tab: 'home' | 'chat') => void
}

export const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  const { t } = useTranslation()

  const tabs = [
    { id: 'home' as const, icon: 'home', label: 'Start' },
    { id: 'chat' as const, icon: 'users', label: t('chat.title') },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40">
      <div className="container mx-auto max-w-lg">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon name={tab.icon} size={24} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
