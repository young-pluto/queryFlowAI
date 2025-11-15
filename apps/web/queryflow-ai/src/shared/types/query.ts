import type { Channel } from '@/shared/constants/channels'

export interface Query {
  id: string
  userId: string
  channel: Channel
  message: string
  subject?: string
  sourceHandle?: string
  summary?: string
  tags?: string[]
  department?: string
  priority?: string
  urgency?: number
  sentiment?: string
  status: string
  assignedTo?: string | null
  createdAt: string
  autoResponse?: string
}

