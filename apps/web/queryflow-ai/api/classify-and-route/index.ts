import { classifyMessage } from '../_shared/openai'
import { adminSupabase } from '../_shared/supabase'
import { corsHeaders, jsonResponse } from '../_shared/response'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, { status: 405 })
  }

  try {
    const payload = await req.json()

    const requiredFields = ['userId', 'channel', 'message']
    const missingField = requiredFields.find((field) => !payload?.[field])
    if (missingField) {
      return jsonResponse({ error: `Missing field: ${missingField}` }, { status: 400 })
    }

    const classification = await classifyMessage({
      channel: payload.channel,
      message: payload.message,
      subject: payload.subject,
      source_handle: payload.source_handle,
    })

    const { data, error } = await adminSupabase
      .from('queries')
      .insert([
        {
          user_id: payload.userId,
          channel: payload.channel,
          message: payload.message,
          subject: payload.subject ?? null,
          source_handle: payload.source_handle ?? null,
          department: classification.department,
          sentiment: classification.sentiment,
          urgency: classification.urgency,
          summary: classification.summary,
          tags: classification.tags,
          auto_response: classification.auto_response,
          status: 'new',
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error', error)
      return jsonResponse({ error: 'Failed to store query.' }, { status: 500 })
    }

    return jsonResponse(toClientQuery(data))
  } catch (error) {
    console.error('classify-and-route error', error)
    return jsonResponse({ error: 'Classification failed.' }, { status: 500 })
  }
}

function toClientQuery(row: Record<string, any>) {
  return {
    id: row.id,
    userId: row.user_id,
    channel: row.channel,
    message: row.message,
    subject: row.subject,
    sourceHandle: row.source_handle,
    department: row.department,
    sentiment: row.sentiment,
    urgency: row.urgency,
    summary: row.summary,
    tags: row.tags,
    autoResponse: row.auto_response,
    status: row.status,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
  }
}

