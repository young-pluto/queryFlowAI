import type { Channel } from '@/shared/constants/channels'

export interface Query {
  id: string
  userId: string
  channel: Channel
  message: string
  summary?: string
  tags?: string[]
  department?: string
  priority?: string
  sentiment?: string
  status: string
  assignedTo?: string
  createdAt: string
  autoResponse?: string
}

