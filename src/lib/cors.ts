const ALLOWED_ORIGINS = ['https://phdonassolo.com', 'https://www.phdonassolo.com']

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export function corsOptionsResponse(request: Request) {
  return new Response(null, { status: 204, headers: getCorsHeaders(request) })
}
