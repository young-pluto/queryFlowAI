import { useEffect, useRef, useState } from 'react'
import HomePage from '@/pages'
import UserSubmitPage from '@/pages/UserSubmit'
import { LandingPage } from '@/pages/LandingPage'
import AdminInboxPage from '@/pages/admin/inbox'
import AdminAnalyticsPage from '@/pages/admin/analytics.tsx'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { triggerDemoQuery } from '@/services/queries'

const tabs = [
  { id: 'landing', label: 'Overview', component: 'landing' },
  { id: 'user', label: 'User Console', component: 'user' },
  { id: 'user-submit', label: 'User Submit', component: 'user-submit' },
  { id: 'admin', label: 'Admin Inbox', component: 'admin' },
  { id: 'analytics', label: 'Analytics', component: 'analytics' },
] as const

type TabId = (typeof tabs)[number]['id']

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('landing')
  const [sessionActive, setSessionActive] = useState(false)
  const sessionInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const startSession = () => {
    if (sessionActive) return
    setSessionActive(true)
    fireDemoQuery()
    sessionInterval.current = setInterval(fireDemoQuery, 7000)
  }

  const stopSession = () => {
    setSessionActive(false)
    if (sessionInterval.current) {
      clearInterval(sessionInterval.current)
      sessionInterval.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (sessionInterval.current) {
        clearInterval(sessionInterval.current)
      }
    }
  }, [])

  const fireDemoQuery = async () => {
    try {
      await triggerDemoQuery()
    } catch (error) {
      console.warn('Demo generator hiccup', error)
    }
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            isSessionActive={sessionActive}
            onStartSession={startSession}
            onStopSession={stopSession}
            navigate={(tab) => setActiveTab(tab as TabId)}
          />
        )
      case 'user':
        return <HomePage />
      case 'user-submit':
        return <UserSubmitPage />
      case 'admin':
        return <AdminInboxPage />
      case 'analytics':
        return <AdminAnalyticsPage />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              QueryFlow AI
            </p>
            <h1 className="text-lg font-semibold">
              {sessionActive ? 'Live demo session running' : 'Interactive workspace'}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'rounded-full px-4 text-sm',
                  activeTab === tab.id && 'shadow shadow-primary/30',
                )}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl pb-12">{renderActiveTab()}</main>
    </div>
  )
}

export default App
