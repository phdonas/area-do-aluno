import { createClient } from '@/lib/supabase/server'
import { Bot, MessageSquare, PlaySquare, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default async function SimuladoresPage() {
  const supabase = await createClient()

  const { data: simuladores } = await supabase
    .from('simuladores_roleplay')
    .select('*')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  const { data: ferramentas } = await supabase
    .from('ferramentas_saas')
    .select('*')
    .eq('status', 'ativo')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Simuladores de IA</h1>
        <p className="text-text-secondary mt-1 text-sm font-medium">
          Acelere sua prática simulando cenários reais e testando ferramentas exclusivas do ecossistema.
        </p>
      </div>

      {/* Roleplay Simuladores */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Simulações Interativas (Roleplay)</h2>
        </div>

        {(!simuladores || simuladores.length === 0) ? (
          <div className="bg-surface border border-border-custom shadow-sm rounded-2xl p-8 text-center text-sm text-text-secondary">
            Nenhum simulador de conversa ativo no banco de dados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {simuladores.map((simulador) => (
              <div key={simulador.id} className="bg-surface rounded-2xl p-6 border border-border-custom shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                 <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Bot className="w-6 h-6" />
                    </div>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-md font-bold uppercase tracking-wider">Novo</span>
                 </div>
                 
                 <h3 className="text-lg font-bold text-text-primary">{simulador.nome}</h3>
                 <p className="text-sm text-text-secondary mt-2 mb-6 flex-1 line-clamp-2">
                   {simulador.descricao}
                 </p>
                 
                 <Link href={`/simuladores/${simulador.slug}`} className="cursor-pointer w-full py-3 bg-black/5 hover:bg-black text-text-primary hover:text-white rounded-xl text-sm font-medium transition-colors text-center flex items-center justify-center gap-2">
                   <PlaySquare className="w-4 h-4" />
                   Iniciar Simulação
                 </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ferramentas SaaS */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-text-primary">Ferramentas de IA (SaaS)</h2>
        </div>

        {(!ferramentas || ferramentas.length === 0) ? (
          <div className="bg-surface border border-border-custom shadow-sm rounded-2xl p-8 text-center text-sm text-text-secondary">
            Nenhuma ferramenta SaaS cadastrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {ferramentas.map((ferramenta) => (
               <div key={ferramenta.id} className="bg-surface rounded-2xl p-6 border border-border-custom shadow-sm flex items-center gap-4 cursor-pointer hover:bg-black/5 transition-colors group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {ferramenta.icone || '🛠️'}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary">{ferramenta.nome}</h4>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{ferramenta.descricao}</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </section>
    </div>
  )
}
