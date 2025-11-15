import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const MAX_LENGTH = 280

type TwitterPayload = {
  text: string
}

type TwitterComposerProps = {
  onSubmit: (payload: TwitterPayload) => void
}

export function TwitterComposer({ onSubmit }: TwitterComposerProps) {
  const [text, setText] = useState('')

  const remaining = useMemo(() => MAX_LENGTH - text.length, [text])

  const handlePost = () => {
    if (!text.trim()) return
    onSubmit({ text })
    setText('')
  }

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <Textarea
        placeholder="Compose your tweet..."
        value={text}
        rows={4}
        maxLength={MAX_LENGTH}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{remaining} characters left</span>
        <Button type="button" onClick={handlePost} disabled={text.length === 0}>
          Post
        </Button>
      </div>
    </div>
  )
}

