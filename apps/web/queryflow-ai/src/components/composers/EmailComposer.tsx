import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type EmailPayload = {
  subject: string
  body: string
}

type EmailComposerProps = {
  onSubmit: (payload: EmailPayload) => void
}

export function EmailComposer({ onSubmit }: EmailComposerProps) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleSend = () => {
    if (!subject.trim() && !body.trim()) return
    onSubmit({ subject, body })
    setSubject('')
    setBody('')
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <Input
        placeholder="Subject"
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
      />
      <Textarea
        placeholder="Write your email..."
        value={body}
        rows={6}
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  )
}

