import { Button } from '@/components/ui/button'
import { channels, type Channel } from '@/shared/constants/channels'
import { cn } from '@/lib/utils'
import { Mail, MessageCircle, Twitter, Globe } from 'lucide-react'

const channelIcons: Record<Channel, React.ComponentType<{ className?: string }>> = {
  whatsapp: MessageCircle,
  twitter: Twitter,
  email: Mail,
  web: Globe,
}

type ChannelPickerProps = {
  value: Channel
  onChange: (channel: Channel) => void
  className?: string
}

export function ChannelPicker({ value, onChange, className }: ChannelPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {channels.map((channel) => {
        const Icon = channelIcons[channel]
        const isActive = value === channel
        return (
          <Button
            key={channel}
            type="button"
            variant={isActive ? 'default' : 'outline'}
            className="flex items-center gap-2"
            onClick={() => onChange(channel)}
            aria-pressed={isActive}
          >
            <Icon className="h-4 w-4" />
            <span className="capitalize">{channel}</span>
          </Button>
        )
      })}
    </div>
  )
}

