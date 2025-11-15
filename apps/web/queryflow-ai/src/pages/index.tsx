import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  ArrowRight,
  BarChart2,
  Bot,
  Database,
  Settings,
  Sparkles,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ChannelPicker } from '@/components/ChannelPicker'
import { EmailComposer } from '@/components/composers/EmailComposer'
import { TwitterComposer } from '@/components/composers/TwitterComposer'
import { WhatsAppComposer } from '@/components/composers/WhatsAppComposer'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/ui/navbar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useToast } from '@/hooks/use-toast'
import type { Channel } from '@/shared/constants/channels'
import type { Query } from '@/shared/types/query'
import { classifyAndRoute } from '@/services/classify'
import { buildClassifyRequest, type ClassifyRequest } from '@/shared/utils/composer'
import { cn } from '@/lib/utils'
import { useRealtimeQueries } from '@/hooks/useRealtimeQueries'

const workspaces = [
  { label: 'Flow Studio', icon: Bot },
  { label: 'Semantic Index', icon: Database },
  { label: 'Analytics', icon: BarChart2 },
  { label: 'Settings', icon: Settings },
]

const reviewers = ['AB', 'CD', 'EF']

const DEFAULT_USER_ID = 'user-001'

const STATUS_VARIANTS: Record<string, string> = {
  pending: 'border-amber-500 text-amber-600',
  new: 'border-slate-400 text-slate-600',
  'in-progress': 'border-amber-500 text-amber-700',
  resolved: 'border-emerald-500 text-emerald-600',
  error: 'border-rose-500 text-rose-600',
}

const createTempId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `temp-${Date.now()}`

const buildOptimisticQuery = (id: string, request: ClassifyRequest): Query => ({
  id,
  userId: request.userId,
  channel: request.channel,
  message: request.message,
  status: 'pending',
  createdAt: new Date().toISOString(),
})

const formatRelativeTime = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true })

const priorityFromUrgency = (urgency?: number) => {
  if (urgency === undefined) return 'Normal'
  if (urgency >= 4) return 'High'
  if (urgency >= 2) return 'Medium'
  return 'Low'
}

export default function HomePage() {
  const { toast } = useToast()
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [optimisticQueries, setOptimisticQueries] = useState<Query[]>([])
  const { data: liveQueries = [] } = useRealtimeQueries(100)

  const classifyMutation = useMutation<Query, Error, { request: ClassifyRequest }>({
    mutationFn: ({ request }) => classifyAndRoute(request),
  })

  const combinedQueries = useMemo(
    () => [...optimisticQueries, ...liveQueries],
    [optimisticQueries, liveQueries],
  )

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

  const handleComposerSubmit = (target: Channel, payload: unknown) => {
    const request = buildClassifyRequest(target, payload, DEFAULT_USER_ID)

    if (!request) {
      toast({
        title: 'Add details before sending',
        description: 'Please include content for this channel.',
        variant: 'destructive',
      })
      return
    }

    const tempId = createTempId()
    const optimisticQuery = buildOptimisticQuery(tempId, request)
    setOptimisticQueries((prev) => [optimisticQuery, ...prev])

    classifyMutation.mutate(
      { request },
      {
        onSuccess: (data) => {
          toast({
            title: 'Query routed',
            description: `Department: ${data.department}`,
          })
        },
        onError: (error) => {
          setOptimisticQueries((prev) =>
            prev.map((query) => (query.id === tempId ? { ...query, status: 'error' } : query)),
          )
          toast({
            title: 'Failed to route',
            description: error.message,
            variant: 'destructive',
          })
        },
        onSettled: () => {
          setOptimisticQueries((prev) => prev.filter((query) => query.id !== tempId))
        },
      },
    )
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="gap-1">
          <Badge className="w-fit rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            QueryFlow
          </Badge>
          <p className="text-sm text-sidebar-foreground/70">Operational overview</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workspaces.map(({ label, icon: Icon }, index) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton isActive={index === 1}>
                      <Icon className="text-sidebar-foreground/80" />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Launch new flow
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Navbar />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Playground</h1>
              <p className="text-sm text-muted-foreground">
                Monitor prompts and tune datasets in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <RoleSwitcher />
              <SidebarTrigger className="hidden md:inline-flex" />
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
              <CardTitle>Quick prompt experiment</CardTitle>
              <CardDescription>
                Prototype a new intent and share it with your team instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Give your test a memorable title..." />
              <Textarea placeholder="Describe what the assistant should do..." rows={6} />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => toast({ title: 'Prompt dispatched to staging workers' })}>
                  Run prompt
                </Button>
                <Button variant="outline">
                  Schedule later
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Channel composer</CardTitle>
              <CardDescription>Craft the perfect reply for each channel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChannelPicker value={channel} onChange={setChannel} />
              {channel === 'whatsapp' && (
                <WhatsAppComposer onSubmit={(payload) => handleComposerSubmit('whatsapp', payload)} />
              )}
              {channel === 'twitter' && (
                <TwitterComposer onSubmit={(payload) => handleComposerSubmit('twitter', payload)} />
              )}
              {channel === 'email' && (
                <EmailComposer onSubmit={(payload) => handleComposerSubmit('email', payload)} />
              )}
              {channel === 'web' && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Web chat is coming soon.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recently active reviewers</CardTitle>
              <CardDescription>Latest human-in-the-loop evaluations</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              {reviewers.map((initials) => (
                <div
                  key={initials}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2"
                >
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
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Latest submissions and routing decisions.</CardDescription>
            </CardHeader>
            <CardContent>
              {combinedQueries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Compose a message to see it here.</p>
              ) : (
                <div className="space-y-3">
                  {combinedQueries.map((query) => (
                    <div key={query.id} className="rounded-xl border p-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                        <span className="font-semibold capitalize">{query.channel}</span>
                        <Badge
                          variant="outline"
                          className={cn('capitalize', STATUS_VARIANTS[query.status] ?? '')}
                        >
                          {query.status}
                        </Badge>
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
      </SidebarInset>
    </SidebarProvider>
  )
}

