import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import type { Channel } from '@/shared/constants/channels'
import { useRealtimeQueries } from '@/hooks/useRealtimeQueries'
import { clearQueries, updateQuery } from '@/services/queries'
import { useToast } from '@/hooks/use-toast'

const STATUS_OPTIONS = ['new', 'in-progress', 'resolved'] as const
const ASSIGNEE_OPTIONS = [
  'Technical Support',
  'Billing',
  'Feedback/Feature Request',
  'HR / Internal',
  'Logistics',
  'Maintenance',
  'General Inquiry',
] as const

const STATUS_STYLES: Record<string, string> = {
  new: 'border-slate-200 bg-slate-50 text-slate-700',
  'in-progress': 'border-amber-200 bg-amber-50 text-amber-800',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pending: 'border-sky-200 bg-sky-50 text-sky-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

const priorityFromUrgency = (urgency?: number) => {
  if (urgency === undefined) return 'Normal'
  if (urgency >= 4) return 'High'
  if (urgency >= 2) return 'Medium'
  return 'Low'
}

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
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          {priorityFromUrgency(query.urgency)}
        </Badge>
      </div>
    </button>
  )
}

type QueryDetailPanelProps = {
  query: Query | null
  onAssign: (id: string, assignee?: string) => void
  onChangeStatus: (id: string, status: Query['status']) => void
}

function QueryDetailPanel({ query, onAssign, onChangeStatus }: QueryDetailPanelProps) {
  const [note, setNote] = useState('')
  const [manualAssignee, setManualAssignee] = useState<string>('Unassigned')

  useEffect(() => {
    setManualAssignee(query?.assignedTo ?? 'Unassigned')
  }, [query?.assignedTo, query?.id])

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
            <DetailRow label="Priority" value={priorityFromUrgency(query.urgency)} />
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onAssign(query.id, query.department ?? 'AI Routing')}
            >
              Auto assign (AI)
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
          <div className="flex flex-wrap gap-2 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              Assign to:
              <select
                className="rounded-md border px-3 py-2 text-sm"
                value={manualAssignee}
                onChange={(event) => {
                  const value = event.target.value
                  setManualAssignee(value)
                  onAssign(query.id, value === 'Unassigned' ? undefined : value)
                }}
              >
                <option value="Unassigned">Unassigned</option>
                {ASSIGNEE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
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
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: queries = [] } = useRealtimeQueries(200)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [channelFilter, setChannelFilter] = useState<'all' | Channel>('all')

  const filteredQueries = useMemo(() => {
    if (channelFilter === 'all') return queries
    return queries.filter((query) => query.channel === channelFilter)
  }, [queries, channelFilter])

  const selectedQuery = useMemo(() => {
    if (!selectedId) return filteredQueries[0] ?? null
    return filteredQueries.find((query) => query.id === selectedId) ?? filteredQueries[0] ?? null
  }, [filteredQueries, selectedId])

  const mutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Pick<Query, 'status' | 'assignedTo'>> }) =>
      updateQuery(id, updates),
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: (error as Error).message,
        variant: 'destructive',
      })
    },
    onSuccess: (data) => {
      toast({
        title: 'Query updated',
        description: `${data.status} • ${data.assignedTo ?? 'Unassigned'}`,
      })
      queryClient.invalidateQueries({ queryKey: ['queries', { limit: 200 }] })
    },
  })

  const handleAssign = (id: string, assignee?: string) => {
    mutation.mutate({ id, updates: { assignedTo: assignee ?? null } })
  }

  const handleChangeStatus = (id: string, status: Query['status']) => {
    mutation.mutate({ id, updates: { status } })
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {[{ label: 'All', value: 'all' }, ...channels.map((channel) => ({ label: channel, value: channel }))].map(
            ({ label, value }) => (
              <Button
                key={value}
                type="button"
                variant={channelFilter === value ? 'default' : 'outline'}
                className="capitalize"
                onClick={() => {
                  setChannelFilter(value as 'all' | Channel)
                  setSelectedId(null)
                }}
              >
                {label}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            className="ml-auto text-xs"
            onClick={async () => {
              try {
                await clearQueries()
                queryClient.invalidateQueries({ queryKey: ['queries', { limit: 200 }] })
                toast({ title: 'Inbox cleared' })
              } catch (error) {
                toast({
                  title: 'Failed to clear inbox',
                  description: (error as Error).message,
                  variant: 'destructive',
                })
              }
            }}
          >
            Clear inbox
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-3 rounded-xl border p-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total queries</span>
            <span>
              {filteredQueries.length} / {queries.length}
            </span>
          </div>
          <div className="space-y-2">
            {filteredQueries.map((query) => (
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

