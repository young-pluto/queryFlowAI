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
Return ONLY valid JSON.
`

export async function classifyMessage(
  payload: ClassificationRequest,
): Promise<ClassificationResult> {
  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: CLASSIFICATION_PROMPT },
        { role: 'user', content: JSON.stringify(payload) },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!completion.ok) {
    const errText = await completion.text()
    throw new Error(`OpenAI classification failed: ${errText}`)
  }

  const data = await completion.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI classification returned empty content.')
  }

  const parsed = JSON.parse(content) as ClassificationResult
  parsed.urgency = Math.min(5, Math.max(1, Math.round(parsed.urgency || 1)))
  parsed.tags = Array.isArray(parsed.tags)
    ? parsed.tags.map((tag: string) => tag?.toLowerCase()).filter(Boolean)
    : []

  return parsed
}

type DemoQueryResult = {
  userId: string
  channel: string
  message: string
  subject?: string
  source_handle?: string
}

const DEMO_PROMPT = `
Generate a realistic customer message for a multi-channel support demo.
Return JSON: { "userId": "<id>", "channel": one of ["whatsapp","twitter","email","web"], "message": "...", "subject": optional string, "source_handle": optional string for social channels }.
Keep the message under 220 characters, topical, and varied (billing, outages, feature requests, HR, logistics, maintenance, general inquiries).
`

export async function generateDemoQuery(): Promise<DemoQueryResult> {
  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.8,
      messages: [
        { role: 'system', content: DEMO_PROMPT },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!completion.ok) {
    throw new Error(`OpenAI demo generator failed: ${await completion.text()}`)
  }

  const data = await completion.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('OpenAI demo generator returned empty content.')
  }

  return JSON.parse(content) as DemoQueryResult
}

