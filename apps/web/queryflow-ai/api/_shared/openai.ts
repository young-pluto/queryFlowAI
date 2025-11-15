/// <reference types="node" />

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured.')
}

type ClassificationRequest = {
  channel: string
  message: string
  subject?: string
  source_handle?: string
}

export type ClassificationResult = {
  department: string
  sentiment: string
  urgency: number
  summary: string
  tags: string[]
  auto_response: string
}

const CLASSIFICATION_PROMPT = `
You are an AI assistant that categorizes customer support queries.
Given the JSON payload describing the user's channel, subject (optional) and message body, respond with a JSON object:
{
  "department": one of ["Technical Support","Billing","Feedback/Feature Request","HR / Internal","Logistics","Maintenance","General Inquiry"],
  "sentiment": one of ["positive","neutral","negative"],
  "urgency": integer from 1 (low) to 5 (critical),
  "summary": single sentence summary of the issue,
  "tags": array of 1-4 lowercase keywords,
  "auto_response": short reassuring response (<= 180 characters)
}
Return ONLY valid JSON (no Markdown code fences).
`

export async function classifyMessage(
  payload: ClassificationRequest,
): Promise<ClassificationResult> {
  const content = await callResponsesApi({
    temperature: 0.2,
    system: CLASSIFICATION_PROMPT,
    user: JSON.stringify(payload),
  })

  const parsed = JSON.parse(stripJsonMarkdown(content)) as ClassificationResult
  parsed.urgency = Math.min(5, Math.max(1, Math.round(parsed.urgency || 1)))
  parsed.tags = Array.isArray(parsed.tags)
    ? parsed.tags.map((tag: string) => tag?.toLowerCase()).filter(Boolean)
    : []

  return parsed
}

type DemoQueryPayload = {
  userId: string
  channel: string
  message: string
  subject?: string
  source_handle?: string
}

const DEMO_PROMPT = `
You are simulating customer support traffic across multiple teams.
Return ONLY JSON shaped like an array of 2 to 3 items, each item:
{
  "userId": "user-00#",
  "channel": "<whatsapp|twitter|email|web>",
  "message": "...",
  "subject": "<optional>",
  "source_handle": "<optional social handle>"
}
Guidelines:
- Randomly select a channel each time; do NOT repeat the same channel twice in a row.
- Vary topics: cycle between billing, shipping/logistics, access/security incidents, HR/internal issues, product feedback, outages, maintenance requests, general inquiries.
- Give the user message a distinct voice (short, under 220 chars) and mention relevant context (e.g., region, team size, subscription tier) to keep the demo lively.
- When channel is Twitter, include "source_handle".
- When channel is email, include "subject".
- For WhatsApp/web, omit subject and handle.
- Alternate urgency implicitly via wording (panicked vs casual).
- Return raw JSON (no Markdown code fences).
`

export async function generateDemoQueryBatch(): Promise<DemoQueryPayload[]> {
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const content = await callResponsesApi({
    temperature: 0.9,
    system: DEMO_PROMPT,
    user: JSON.stringify({ seed }),
  })

  const sanitized = stripJsonMarkdown(content)
  try {
    const parsed = JSON.parse(sanitized)
    if (Array.isArray(parsed)) {
      return parsed as DemoQueryPayload[]
    }
    return [parsed as DemoQueryPayload]
  } catch {
    const objects = extractJsonObjects(sanitized)
    return objects.map((chunk) => JSON.parse(chunk.trim()) as DemoQueryPayload)
  }
}

async function callResponsesApi({
  system,
  user,
  temperature,
}: {
  system: string
  user: string
  temperature: number
}): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${await response.text()}`)
  }

  const data = await response.json()
  const textCandidate =
    data?.output?.[0]?.content?.[0]?.text?.value ??
    data?.output?.[0]?.content?.[0]?.text ??
    data?.output_text?.[0] ??
    data?.choices?.[0]?.message?.content

  if (!textCandidate || typeof textCandidate !== 'string') {
    console.error('OpenAI responses payload', JSON.stringify(data, null, 2))
    throw new Error('OpenAI returned empty content.')
  }

  return textCandidate
}

function stripJsonMarkdown(text: string) {
  let sanitized = text.trim()
  const fenceMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) {
    sanitized = fenceMatch[1].trim()
  }
  return sanitized
}

function extractJsonObjects(payload: string) {
  const chunks: string[] = []
  let depth = 0
  let start = -1

  for (let i = 0; i < payload.length; i++) {
    const char = payload[i]
    if (char === '{') {
      if (depth === 0) {
        start = i
      }
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        chunks.push(payload.slice(start, i + 1))
        start = -1
      }
    }
  }

  if (chunks.length === 0 && start !== -1) {
    chunks.push(payload.slice(start))
  }

  return chunks.length > 0 ? chunks : [payload.trim()]
}


