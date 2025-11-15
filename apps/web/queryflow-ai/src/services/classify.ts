import type { Query } from '@/shared/types/query'
import type { ClassifyRequest } from '@/shared/utils/composer'

export async function classifyAndRoute(
  request: ClassifyRequest,
): Promise<Query> {
  const response = await fetch('/api/classify-and-route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    let message = 'Failed to classify query.'
    try {
      const errorBody = await response.json()
      message = errorBody.error ?? message
    } catch {
      message = await response.text()
    }
    throw new Error(message)
  }

  return response.json()
}

