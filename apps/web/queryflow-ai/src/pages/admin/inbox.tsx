import { useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { Query } from '@/shared/types/query'
import { channels } from '@/shared/constants/channels'

const STATUS_OPTIONS = ['new', 'in-progress', 'resolved'] as const

const STATUS_STYLES: Record<string, string> = {
  new: 'border-slate-200 bg-slate-50 text-slate-700',
  'in-progress': 'border-amber-200 bg-amber-50 text-amber-800',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-sky-200 bg-sky-50 text-sky-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

const SAMPLE_QUERIES: Query[] = [
  {
    id: 'q-101',
    userId: 'u-1',
    channel: 'whatsapp',
    message: 'My payment failed but the amount was deducted.',
    summary: 'Payment failure reported via WhatsApp.',
    tags: ['billing', 'payment'],
    department: 'Billing',
    priority: 'High',
    sentiment: 'frustrated',
    status: 'new',
    assignedTo: undefined,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    autoResponse: 'Thanks for flagging this. Our billing team will investigate shortly.',
  },
  {
    id: 'q-102',
    userId: 'u-2',
    channel: 'twitter',
    message: 'Loving the new update but the analytics screen is slow.',
    summary: 'Positive feedback with a performance concern.',
    tags: ['performance'],
    department: 'Product',
    priority: 'Medium',
    sentiment: 'positive',
    status: 'in-progress',
    assignedTo: 'Nora',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    autoResponse: 'Thanks for the feedback! We are optimizing analytics performance.',
  },
  {
    id: 'q-103',
    userId: 'u-3',
    channel: 'email',
    message: 'Need help resetting admin passwords for my team.',
    summary: 'Admin is requesting password reset guidance.',
    tags: ['admin', 'security'],
    department: 'Support',
    priority: 'Low',
    sentiment: 'neutral',
    status: 'resolved',
    assignedTo: 'Alex',
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    autoResponse: 'We have sent you the reset instructions.',
  },
]

const statusLabel = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

type QueryCardProps = {
  query: Query
  isActive: boolean
  onClick: () => void
}

function QueryCard({ query, isActive, onClick }: QueryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition hover:border-primary/50',
        isActive && 'border-primary bg-primary/5',
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold capitalize">{query.channel}</span>
        <span>{formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground">{query.message}</p>
      {query.summary && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{query.summary}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {query.department && (
          <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
            {query.department}
          </Badge>
        )}
        {query.priority && (
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {query.priority}
          </Badge>
        )}
      </div>
    </button>
  )
}

type QueryDetailPanelProps = {
  query: Query | null
  onAssign: (id: string, assignee: string) => void
  onChangeStatus: (id: string, status: Query['status']) => void
}

function QueryDetailPanel({ query, onAssign, onChangeStatus }: QueryDetailPanelProps) {
  const [note, setNote] = useState('')

  if (!query) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        Select a conversation to view its full context.
      </div>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full capitalize">
            {query.channel}
          </Badge>
          <Badge
            variant="outline"
            className={cn('rounded-full capitalize', STATUS_STYLES[query.status] ?? '')}
          >
            {statusLabel(query.status)}
          </Badge>
        </div>
        <CardTitle className="text-xl">{query.summary ?? 'No summary yet'}</CardTitle>
        <CardDescription>{formatDistanceToNow(new Date(query.createdAt), { addSuffix: true })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground">Message</h3>
          <p className="mt-2 rounded-lg bg-muted/40 p-3 text-sm">{query.message}</p>
        </section>

        <section className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <DetailRow label="Department" value={query.department} />
            <DetailRow label="Priority" value={query.priority} />
            <DetailRow label="Sentiment" value={query.sentiment} />
            <DetailRow label="Assigned" value={query.assignedTo ?? 'Unassigned'} />
          </div>
          {query.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {query.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </section>

        {query.autoResponse && (
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground">AI Suggested Response</h3>
            <p className="mt-2 rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
              {query.autoResponse}
            </p>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onAssign(query.id, 'You')}
            >
              {query.assignedTo ? `Reassign (${query.assignedTo})` : 'Assign to me'}
            </Button>
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={query.status}
              onChange={(event) => onChangeStatus(query.id, event.target.value as Query['status'])}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {statusLabel(option)}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note or response draft..."
            rows={4}
          />
          <Button type="button" disabled={!note.trim()} onClick={() => setNote('')}>
            Save note
          </Button>
        </section>
      </CardContent>
    </Card>
  )
}

type DetailRowProps = {
  label: string
  value?: string | null
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value ?? '—'}</p>
    </div>
  )
}

export default function AdminInboxPage() {
  const [queries, setQueries] = useState<Query[]>(SAMPLE_QUERIES)
  const [selectedId, setSelectedId] = useState(queries[0]?.id ?? null)

  const selectedQuery = useMemo(
    () => queries.find((query) => query.id === selectedId) ?? null,
    [queries, selectedId],
  )

  const handleAssign = (id: string, assignee: string) => {
    setQueries((prev) =>
      prev.map((query) => (query.id === id ? { ...query, assignedTo: assignee } : query)),
    )
  }

  const handleChangeStatus = (id: string, status: Query['status']) => {
    setQueries((prev) =>
      prev.map((query) => (query.id === id ? { ...query, status } : query)),
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            QueryFlow Admin
          </p>
          <h1 className="text-2xl font-semibold">Inbox</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {channels.map((channel) => (
            <Badge key={channel} variant="outline" className="capitalize">
              {channel}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total queries</span>
            <span>{queries.length}</span>
          </div>
          <div className="space-y-2">
            {queries.map((query) => (
              <QueryCard
                key={query.id}
                query={query}
                isActive={selectedId === query.id}
                onClick={() => setSelectedId(query.id)}
              />
            ))}
          </div>
        </div>

        <QueryDetailPanel
          query={selectedQuery}
          onAssign={handleAssign}
          onChangeStatus={handleChangeStatus}
        />
      </div>
    </div>
  )
}

