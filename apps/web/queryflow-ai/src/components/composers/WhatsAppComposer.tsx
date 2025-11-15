import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type WhatsAppPayload = {
  message: string
}

type WhatsAppComposerProps = {
  onSubmit: (payload: WhatsAppPayload) => void
}

const sampleMessages = [
  { id: 1, author: 'Customer', text: 'Hi, I need help with my order.' },
  { id: 2, author: 'Agent', text: 'Sure! Can you share the order ID?' },
]

export function WhatsAppComposer({ onSubmit }: WhatsAppComposerProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    if (!message.trim()) return
    onSubmit({ message })
    setMessage('')
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="space-y-2 rounded-lg bg-muted/40 p-3">
        {sampleMessages.map((msg) => (
          <div key={msg.id} className="rounded-lg bg-background p-2 text-sm shadow-sm">
            <div className="font-semibold">{msg.author}</div>
            <div>{msg.text}</div>
          </div>
        ))}
      </div>
      <Textarea
        placeholder="Write a WhatsApp reply..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={handleSubmit}>
          Send
        </Button>
      </div>
    </div>
  )
}

