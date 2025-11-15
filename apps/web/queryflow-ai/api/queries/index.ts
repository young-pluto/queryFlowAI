import { adminSupabase } from '../_shared/supabase'
import { corsHeaders, jsonResponse } from '../_shared/response'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method === 'GET') {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get('limit') ?? 50)
    const status = url.searchParams.get('status')

    const query = adminSupabase
      .from('queries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase fetch error', error)
      return jsonResponse({ error: 'Failed to fetch queries.' }, { status: 500 })
    }

    return jsonResponse(data.map(toClientQuery))
  }

  if (req.method === 'DELETE') {
    const { error } = await adminSupabase.from('queries').delete().neq('id', '')
    if (error) {
      console.error('Supabase delete error', error)
      return jsonResponse({ error: 'Failed to clear queries.' }, { status: 500 })
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Method Not Allowed' }, { status: 405 })
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

