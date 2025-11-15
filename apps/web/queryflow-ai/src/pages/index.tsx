import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useRealtimeQueries } from '@/hooks/useRealtimeQueries'

const reviewers = ['AB', 'CD', 'EF']

const formatRelativeTime = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true })

const priorityFromUrgency = (urgency?: number) => {
  if (urgency === undefined) return 'Normal'
  if (urgency >= 4) return 'High'
  if (urgency >= 2) return 'Medium'
  return 'Low'
}

const STATUS_VARIANTS: Record<string, string> = {
  new: 'border-slate-400 text-slate-600',
  'in-progress': 'border-amber-500 text-amber-700',
  resolved: 'border-emerald-500 text-emerald-600',
  pending: 'border-amber-500 text-amber-600',
  error: 'border-rose-500 text-rose-600',
}

export default function RoutingPage() {
  const { data: liveQueries = [] } = useRealtimeQueries(200)

  const insights = useMemo(() => {
    const total = liveQueries.length
    const positive = liveQueries.filter((q) => q.sentiment === 'positive').length
    const avgUrgency =
      total === 0
        ? '—'
        : (liveQueries.reduce((sum, q) => sum + (q.urgency ?? 1), 0) / total).toFixed(1)

    return [
      { title: 'Total queries', metric: total.toString(), delta: 'Live demo data' },
      {
        title: 'Positive sentiment',
        metric: total ? `${Math.round((positive / total) * 100)}%` : '0%',
        delta: `${positive} cheering users`,
      },
      { title: 'Avg urgency', metric: avgUrgency, delta: '1 (low) → 5 (critical)' },
    ]
  }, [liveQueries])

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Routing manager
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Live routing overview</h1>
          <p className="text-sm text-muted-foreground">
            See every AI decision across channels and departments in one place.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {insights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardDescription>{item.title}</CardDescription>
              <CardTitle className="text-3xl">{item.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recently active reviewers</CardTitle>
          <CardDescription>Latest human-in-the-loop evaluations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {reviewers.map((initials) => (
            <div key={initials} className="flex items-center gap-3 rounded-xl border px-3 py-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${initials}`} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Operator {initials}</p>
                <p className="text-xs text-muted-foreground">12 reviews in the last hour</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Routing inbox</CardTitle>
          <CardDescription>Latest submissions and AI decisions.</CardDescription>
        </CardHeader>
        <CardContent>
          {liveQueries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Compose a message to see it here.</p>
          ) : (
            <div className="space-y-3">
              {liveQueries.map((query) => (
                <div key={query.id} className="rounded-xl border p-3 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between text-xs uppercase tracking-wide text-muted-foreground gap-2">
                    <span className="font-semibold capitalize">{query.channel}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        Assigned: {query.assignedTo ?? 'Unassigned'}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn('capitalize', STATUS_VARIANTS[query.status] ?? '')}
                      >
                        {query.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{query.message}</p>
                  {query.summary && (
                    <p className="mt-2 text-sm text-muted-foreground">{query.summary}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{formatRelativeTime(query.createdAt)}</span>
                    {query.department && <span>Dept: {query.department}</span>}
                    <span>Priority: {priorityFromUrgency(query.urgency)}</span>
                    {query.sentiment && <span>Sentiment: {query.sentiment}</span>}
                  </div>
                  {query.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {query.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {query.autoResponse && (
                    <div className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                      Auto response: {query.autoResponse}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

