import type { Query } from '@/shared/types/query'

export async function fetchQueries(limit = 100): Promise<Query[]> {
  const response = await fetch(`/api/queries?limit=${limit}`)
  if (!response.ok) {
    throw new Error('Failed to fetch queries.')
  }
  return response.json()
}

export async function updateQuery(
  id: string,
  updates: Partial<Pick<Query, 'status' | 'assignedTo'>>,
): Promise<Query> {
  const response = await fetch(`/api/queries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Failed to update query.')
  }

  return response.json()
}

export async function triggerDemoQuery(): Promise<Query[]> {
  const response = await fetch('/api/generate-demo-query', { method: 'POST' })
  if (!response.ok) {
    throw new Error('Failed to generate demo query.')
  }
  return response.json()
}

export async function clearQueries(): Promise<void> {
  const response = await fetch('/api/queries', { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('Failed to clear queries.')
  }
}

