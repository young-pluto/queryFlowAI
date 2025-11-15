import type { ClassifyRequest } from '@/shared/utils/composer'

export type ClassifyResponse = {
  department: string
  priority: number
  sentiment: string
  summary: string
  tags: string[]
  auto_response: string
}

export async function classifyAndRoute(
  request: ClassifyRequest,
): Promise<ClassifyResponse> {
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

