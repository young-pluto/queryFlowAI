export const config = {
  runtime: 'edge',
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: corsHeaders,
    })
  }

  try {
    const payload = await req.json()

    const requiredFields = ['userId', 'channel', 'message']
    const missingField = requiredFields.find((field) => !payload?.[field])
    if (missingField) {
      return new Response(JSON.stringify({ error: `Missing field: ${missingField}` }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    const stubResult = {
      department: 'General',
      priority: 3,
      sentiment: 'neutral',
      summary: 'stub summary',
      tags: ['general'],
      auto_response: "Thanks. We'll look into it.",
    }

    return new Response(JSON.stringify(stubResult), {
      status: 200,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error('classify-and-route error', error)
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: corsHeaders,
    })
  }
}

