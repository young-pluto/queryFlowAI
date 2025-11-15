import { useState } from 'react'
import HomePage from '@/pages'
import UserSubmitPage from '@/pages/UserSubmit'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'dashboard', label: 'Dashboard', component: <HomePage /> },
  { id: 'user-submit', label: 'User Submit', component: <UserSubmitPage /> },
] as const

type TabId = (typeof tabs)[number]['id']

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  const activeComponent = tabs.find((tab) => tab.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              QueryFlow AI
            </p>
            <h1 className="text-lg font-semibold">Preview workspace</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-full px-4',
                  activeTab === tab.id && 'shadow shadow-primary/30',
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl pb-12">{activeComponent}</main>
    </div>
  )
}

export default App
