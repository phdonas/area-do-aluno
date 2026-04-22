import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Zap, ShoppingBag, CreditCard, PlayCircle, Sparkles, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { CatalogClient } from './CatalogClient'

export const dynamic = 'force-dynamic'

export default async function UnifiedCatalogoPage() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 1. Buscar todos os cursos publicados com seus pilares
  const { data: cursosRaw } = await supabase
    .from('cursos')
    .select('*, cursos_pilares(pilares(id, slug, nome))')
    .eq('status', 'publicado')
    .order('created_at', { ascending: false })

  const cursos = cursosRaw?.map(c => ({
    ...c,
    pilar_slugs: c.cursos_pilares?.map((cp: any) => cp.pilares?.slug).filter(Boolean) || [],
    pilar_nomes: c.cursos_pilares?.map((cp: any) => cp.pilares?.nome).filter(Boolean) || []
  })) || []

  // 2. Buscar todos os pacotes publicados
  const { data: pacotes } = await supabase
    .from('pacotes')
    .select('*')
    .eq('status', 'publicado')

  // 3. Buscar Pilares dinâmicos
  const { data: pilares } = await supabase
    .from('pilares')
    .select('*')
    .order('ordem', { ascending: true })

  // 4. Verificar acessos do usuário
  let idsAcessos: string[] = []
  if (user) {
    const { data: assinaturas } = await supabaseAdmin
      .from('assinaturas')
      .select('curso_id, planos(is_global)')
      .eq('usuario_id', user.id)
      .eq('status', 'ativa')
    
    const possuiGlobal = assinaturas?.some((a: any) => a.planos?.is_global)
    if (possuiGlobal) {
      idsAcessos = cursos?.map(c => c.id) || []
    } else {
      idsAcessos = assinaturas?.map(a => a.curso_id).filter(Boolean) as string[] || []
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 animate-in fade-in duration-1000">
      
      {/* HERO SECTION - Respeitando o tema via CSS Variables */}
      <section className="relative overflow-hidden rounded-[3rem] bg-surface p-12 md:p-20 shadow-xl border border-border-custom">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-primary/10 to-transparent z-0" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-primary/70 italic">Phdonassolo Academy</span>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter leading-[0.9] italic">
             EXPLORE O <span className="text-primary italic">CONHECIMENTO.</span>
           </h1>
           
           <p className="text-lg text-text-secondary font-medium leading-relaxed italic">
             Navegue pelos pilares estratégicos e encontre o treinamento ideal para sua evolução profissional.
           </p>
        </div>
      </section>

      {/* CLIENT-SIDE CATALOG (Filtering & Search) */}
      <CatalogClient 
        cursos={cursos || []} 
        pacotes={pacotes || []} 
        pilares={pilares || []} 
        idsAcessos={idsAcessos}
      />

    </div>
  )
}
