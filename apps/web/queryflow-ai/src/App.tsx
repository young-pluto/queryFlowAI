import { useEffect, useRef, useState } from 'react'
import RoutingPage from '@/pages'
import UserConsolePage from '@/pages/UserConsole'
import { LandingPage } from '@/pages/LandingPage'
import AdminInboxPage from '@/pages/admin/inbox'
import AdminAnalyticsPage from '@/pages/admin/analytics.tsx'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { triggerDemoQuery } from '@/services/queries'

const tabs = [
  { id: 'landing', label: 'Overview', component: 'landing' },
  { id: 'routing', label: 'Routing', component: 'routing' },
  { id: 'user-console', label: 'User Console', component: 'user-console' },
  { id: 'admin', label: 'Admin Inbox', component: 'admin' },
  { id: 'analytics', label: 'Analytics', component: 'analytics' },
] as const

const SESSION_DURATION_MS = 30_000

const formatCountdown = (value: number) => {
  const safe = Math.max(0, value)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type TabId = (typeof tabs)[number]['id']

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('landing')
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionCountdown, setSessionCountdown] = useState(0)
  const sessionInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionEndsAt = useRef<number | null>(null)

  const updateCountdown = () => {
    if (!sessionEndsAt.current) return
    const remaining = Math.max(0, Math.ceil((sessionEndsAt.current - Date.now()) / 1000))
    setSessionCountdown(remaining)
    if (remaining <= 0) {
      stopSession()
    }
  }

  const startSession = () => {
    if (sessionActive) return
    setSessionActive(true)
    const endsAt = Date.now() + SESSION_DURATION_MS
    sessionEndsAt.current = endsAt
    setSessionCountdown(Math.round(SESSION_DURATION_MS / 1000))
    fireDemoQuery()
    sessionInterval.current = setInterval(fireDemoQuery, 7000)
    countdownInterval.current = setInterval(updateCountdown, 1000)
    sessionTimeout.current = setTimeout(() => stopSession(), SESSION_DURATION_MS)
  }

  const stopSession = () => {
    setSessionActive(false)
    setSessionCountdown(0)
    sessionEndsAt.current = null
    if (sessionInterval.current) {
      clearInterval(sessionInterval.current)
      sessionInterval.current = null
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current)
      countdownInterval.current = null
    }
    if (sessionTimeout.current) {
      clearTimeout(sessionTimeout.current)
      sessionTimeout.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (sessionInterval.current) {
        clearInterval(sessionInterval.current)
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current)
      }
      if (sessionTimeout.current) {
        clearTimeout(sessionTimeout.current)
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
            sessionCountdown={sessionCountdown}
            navigate={(tab) => setActiveTab(tab as TabId)}
          />
        )
      case 'routing':
        return <RoutingPage />
      case 'user-console':
        return <UserConsolePage />
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
              {sessionActive
                ? `Live demo session running · ${formatCountdown(sessionCountdown)}`
                : 'Interactive workspace'}
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

      <main className="mx-auto max-w-6xl pb-12">
        {sessionActive && (
          <SessionIndicator
            countdown={sessionCountdown}
            onStop={stopSession}
          />
        )}
        {renderActiveTab()}
      </main>
    </div>
  )
}

export default App

function SessionIndicator({ countdown, onStop }: { countdown: number; onStop: () => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-primary">
      <div>
        <p className="font-semibold">Session active · {formatCountdown(countdown)}</p>
        <p className="text-xs text-primary/70">Auto-stops when the timer hits zero.</p>
      </div>
      <Button variant="outline" size="sm" onClick={onStop}>
        Stop session
      </Button>
    </div>
  )
}
