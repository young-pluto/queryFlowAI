import { adminSupabase } from '../../_shared/supabase'
import { corsHeaders, jsonResponse } from '../../_shared/response'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request, context: { params: { id: string } }): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const id = context?.params?.id
  if (!id) {
    return jsonResponse({ error: 'Missing query id' }, { status: 400 })
  }

  if (req.method === 'PATCH') {
    try {
      const body = await req.json()
      const updates: Record<string, any> = {}

      if (body.status) {
        updates.status = body.status
      }
      if (body.assignedTo !== undefined) {
        updates.assigned_to = body.assignedTo
      }

      if (Object.keys(updates).length === 0) {
        return jsonResponse({ error: 'No updates provided.' }, { status: 400 })
      }

      const { data, error } = await adminSupabase
        .from('queries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Supabase update error', error)
        return jsonResponse({ error: 'Failed to update query.' }, { status: 500 })
      }

      return jsonResponse(rowToClient(data))
    } catch (error) {
      console.error('Failed to parse PATCH body', error)
      return jsonResponse({ error: 'Invalid request body' }, { status: 400 })
    }
  }

  return jsonResponse({ error: 'Method Not Allowed' }, { status: 405 })
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

