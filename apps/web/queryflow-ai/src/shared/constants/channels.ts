export const channels = ['whatsapp', 'twitter', 'email', 'web'] as const

export type Channel = (typeof channels)[number]

