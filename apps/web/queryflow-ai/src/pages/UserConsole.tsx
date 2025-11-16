import { useState } from 'react'
import { ChannelPicker } from '@/components/ChannelPicker'
import { EmailComposer } from '@/components/composers/EmailComposer'
import { TwitterComposer } from '@/components/composers/TwitterComposer'
import { WhatsAppComposer } from '@/components/composers/WhatsAppComposer'
import { RoleSwitcher } from '@/components/RoleSwitcher'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Channel } from '@/shared/constants/channels'
import { buildClassifyRequest } from '@/shared/utils/composer'
import { classifyAndRoute } from '@/services/classify'
import { Loader2 } from 'lucide-react'

const USER_ID = 'user-001'

export default function UserConsolePage() {
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [preview, setPreview] = useState<object | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (payload: unknown) => {
    const request = buildClassifyRequest(channel, payload, USER_ID)

    if (!request) {
      setPreview({ error: 'Add a message before submitting.' })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await classifyAndRoute(request)
      const composedPayload = {
        request,
        response,
      }
      console.log('[UserSubmit] payload:', composedPayload)
      setPreview(composedPayload)
    } catch (error) {
      setPreview({
        request,
        error: (error as Error).message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderComposer = () => {
    switch (channel) {
      case 'twitter':
        return <TwitterComposer onSubmit={handleSubmit} />
      case 'email':
        return <EmailComposer onSubmit={handleSubmit} />
      case 'web':
        return (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Web composer is coming soon.
            </CardContent>
          </Card>
        )
      case 'whatsapp':
      default:
        return <WhatsAppComposer onSubmit={handleSubmit} />
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            User console
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Compose and submit queries</h1>
          <p className="text-sm text-muted-foreground">
            Switch context, pick a channel, and send a live complaint into the routing engine.
          </p>
        </div>
        <RoleSwitcher />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Choose channel</CardTitle>
          <CardDescription>Select how this message should be delivered.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChannelPicker value={channel} onChange={setChannel} />
        </CardContent>
      </Card>

      {isSubmitting && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Sending payload to classifier…</span>
        </div>
      )}

      {renderComposer()}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Preview payload
          </h2>
        </div>
        <Separator className="my-2" />
        <div className="max-h-64 overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
          {isSubmitting ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Fetching payload…</span>
            </div>
          ) : preview ? (
            <pre className="whitespace-pre-wrap text-left">{JSON.stringify(preview, null, 2)}</pre>
          ) : (
            'Payload will appear here after you submit.'
          )}
        </div>
      </div>
    </div>
  )
}

