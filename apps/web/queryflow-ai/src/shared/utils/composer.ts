import type { Channel } from '@/shared/constants/channels'

export type ClassifyRequest = {
  userId: string
  channel: Channel
  message: string
  subject?: string
  source_handle?: string
}

type WhatsAppPayload = {
  message?: string
}

type TwitterPayload = {
  text?: string
  source_handle?: string
}

type EmailPayload = {
  subject?: string
  body?: string
}

export function buildClassifyRequest(
  channel: Channel,
  payload: unknown,
  userId: string,
): ClassifyRequest | null {
  const base: ClassifyRequest = {
    userId,
    channel,
    message: '',
  }

  switch (channel) {
    case 'whatsapp': {
      const data = payload as WhatsAppPayload
      if (!data?.message) return null
      return {
        ...base,
        message: data.message,
      }
    }
    case 'twitter': {
      const data = payload as TwitterPayload
      if (!data?.text) return null
      return {
        ...base,
        message: data.text,
        source_handle: data.source_handle ?? '@queryflow-demo',
      }
    }
    case 'email': {
      const data = payload as EmailPayload
      if (!data?.body) return null
      return {
        ...base,
        message: data.body,
        subject: data.subject,
      }
    }
    case 'web':
    default:
      return null
  }
}

