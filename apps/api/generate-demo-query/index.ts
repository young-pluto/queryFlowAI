import { generateDemoQuery, classifyMessage } from '../_shared/openai'
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
    const synthetic = await generateDemoQuery()

    const classification = await classifyMessage({
      channel: synthetic.channel,
      message: synthetic.message,
      subject: synthetic.subject,
      source_handle: synthetic.source_handle,
    })

    const { data, error } = await adminSupabase
      .from('queries')
      .insert([
        {
          user_id: synthetic.userId,
          channel: synthetic.channel,
          message: synthetic.message,
          subject: synthetic.subject ?? null,
          source_handle: synthetic.source_handle ?? null,
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
      console.error('Supabase demo insert error', error)
      return jsonResponse({ error: 'Failed to insert demo query.' }, { status: 500 })
    }

    return jsonResponse(rowToClient(data))
  } catch (error) {
    console.error('generate-demo-query error', error)
    return jsonResponse({ error: 'Failed to generate query.' }, { status: 500 })
  }
}

function rowToClient(row: Record<string, any>) {
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

