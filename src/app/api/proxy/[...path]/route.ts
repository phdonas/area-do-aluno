import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const pathArray = resolvedParams.path || []
    
    // O caminho completo no Supabase Storage
    const storagePath = pathArray.join('/')
    
    // Obter URL do Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      return new NextResponse('Supabase URL não configurada', { status: 500 })
    }

    // Montar a URL pública do Storage
    const targetUrl = `${supabaseUrl}/storage/v1/object/public/${storagePath}`

    // Fazer a requisição para o Supabase
    const response = await fetch(targetUrl)

    if (!response.ok) {
      return new NextResponse(`Erro ao buscar arquivo: ${response.statusText}`, { status: response.status })
    }

    // Obter o conteúdo
    const data = await response.arrayBuffer()
    
    // Preparar os headers LIMPOS
    const headers = new Headers()
    
    // Garantir que HTML seja servido corretamente
    if (storagePath.endsWith('.html')) {
      headers.set('Content-Type', 'text/html; charset=utf-8')
    } else if (storagePath.endsWith('.css')) {
      headers.set('Content-Type', 'text/css; charset=utf-8')
    } else if (storagePath.endsWith('.js')) {
      headers.set('Content-Type', 'application/javascript; charset=utf-8')
    } else if (storagePath.endsWith('.svg')) {
      headers.set('Content-Type', 'image/svg+xml')
    }

    // Retornar a resposta com os headers modificados
    return new NextResponse(data, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Erro no proxy de simulador:', error)
    return new NextResponse('Erro interno no servidor', { status: 500 })
  }
}
