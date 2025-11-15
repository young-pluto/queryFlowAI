import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRealtimeQueries } from '@/hooks/useRealtimeQueries'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

const sentimentColors: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#818cf8',
  negative: '#f97316',
}

const urgencyColors = ['#86efac', '#4ade80', '#facc15', '#f97316', '#ef4444']

export default function AdminAnalyticsPage() {
  const { data: queries = [] } = useRealtimeQueries(200)

  const byDepartment = useMemo(() => aggregateCounts(queries, 'department'), [queries])
  const bySentiment = useMemo(() => aggregateCounts(queries, 'sentiment'), [queries])
  const byChannel = useMemo(() => aggregateCounts(queries, 'channel'), [queries])
  const urgencyBuckets = useMemo(() => {
    const buckets: Record<number, number> = {}
    queries.forEach((query) => {
      const level = query.urgency ?? 1
      buckets[level] = (buckets[level] ?? 0) + 1
    })
    return Object.entries(buckets)
      .map(([urgency, value]) => ({ urgency, value }))
      .sort((a, b) => Number(a.urgency) - Number(b.urgency))
  }, [queries])

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Admin analytics
        </p>
        <h1 className="text-2xl font-semibold">AI insights</h1>
        <p className="text-sm text-muted-foreground">
          Live look at query volume, sentiment, urgency, and channel performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Total queries" value={queries.length.toString()} />
        <MetricCard title="Active departments" value={Object.keys(byDepartment).length.toString()} />
        <MetricCard title="Average urgency" value={averageUrgency(queries)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Volume by department">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={Object.entries(byDepartment).map(([name, value]) => ({ name, value }))}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sentiment breakdown">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={Object.entries(bySentiment).map(([name, value]) => ({ name, value }))}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={4}
              >
                {Object.keys(bySentiment).map((sentiment, index) => (
                  <Cell key={sentiment} fill={sentimentColors[sentiment] ?? urgencyColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Urgency distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={urgencyBuckets}>
              <XAxis dataKey="urgency" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {urgencyBuckets.map((_, idx) => (
                  <Cell key={idx} fill={urgencyColors[idx] ?? '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Channel trends">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={Object.entries(byChannel).map(([name, value]) => ({ name, value }))}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function aggregateCounts<T extends Record<string, any>>(list: T[], key: keyof T) {
  return list.reduce<Record<string, number>>((acc, item) => {
    const value = item[key]
    if (!value) return acc
    const normalized = String(value)
    acc[normalized] = (acc[normalized] ?? 0) + 1
    return acc
  }, {})
}

function averageUrgency(queries: Array<{ urgency?: number }>) {
  if (!queries.length) return '—'
  const sum = queries.reduce((total, q) => total + (q.urgency ?? 1), 0)
  return (sum / queries.length).toFixed(1)
}

type MetricCardProps = {
  title: string
  value: string
}

function MetricCard({ title, value }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

type ChartCardProps = {
  title: string
  children: React.ReactNode
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

