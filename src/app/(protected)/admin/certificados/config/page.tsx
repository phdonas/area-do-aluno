import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Award, Plus, Settings, Eye, Trash2 } from 'lucide-react'

export default async function CertificadosConfigPage() {
  const supabase = createAdminClient()

  // Buscar configurações existentes
  const { data: configs } = await supabase
    .from('certificados_config')
    .select('*, cursos(titulo)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 md:p-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="border-l-4 border-indigo-600 pl-6">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mb-2 block">Infraestrutura</span>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter italic uppercase">Designer de Certificados</h1>
          <p className="text-text-secondary mt-2 font-medium">Configure os templates e variáveis de impressão por curso.</p>
        </div>
        <Link 
          href="/admin/certificados/config/novo" 
          className="px-8 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Criar Novo Template
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
        {(!configs || configs.length === 0) ? (
          <div className="col-span-full py-32 bg-surface/50 border-2 border-dashed border-border-custom rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 bg-indigo-600/5 rounded-full flex items-center justify-center">
                <Award className="w-10 h-10 text-indigo-600/20" />
             </div>
             <div>
                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest leading-none">Nenhum template ativo</h3>
                <p className="text-[11px] text-text-muted mt-2 font-medium">Comece configurando o modelo visual para <br/>emissão automática ou manual.</p>
             </div>
          </div>
        ) : (
          configs.map((config) => (
            <div key={config.id} className="group bg-surface border border-border-custom rounded-[2.5rem] overflow-hidden hover:border-indigo-500/50 transition-all shadow-sm">
               <div className="aspect-[1.41] bg-black/5 relative overflow-hidden">
                 {config.template_url ? (
                   <img src={config.template_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center opacity-10">
                     <Award className="w-20 h-20" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="flex gap-2">
                       <Link href={`/admin/certificados/config/${config.id}`} className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase text-center rounded-xl hover:bg-indigo-50">Editar Layout</Link>
                       <button className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700"><Trash2 className="w-4 h-4"/></button>
                    </div>
                 </div>
               </div>
               <div className="p-8 space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Pronto para Emissão</span>
                  </div>
                  <h4 className="text-lg font-black text-text-primary uppercase italic tracking-tighter leading-tight line-clamp-2">
                    {config.cursos?.titulo || 'Doutorado Extra-Curricular'}
                  </h4>
                  <div className="flex items-center justify-between pt-4 border-t border-border-custom">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-indigo-100 flex items-center justify-center text-[8px] font-bold">U</div>)}
                     </div>
                     <span className="text-[9px] font-bold text-text-muted uppercase">128 Alunos Emitidos</span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      {/* DICAS DE DESIGN */}
      <footer className="pt-20">
         <div className="p-10 bg-indigo-600/5 rounded-[3rem] border border-indigo-600/10 flex flex-col md:flex-row items-center gap-10">
            <div className="p-6 bg-white rounded-[2rem] shadow-2xl shadow-indigo-600/10 rotate-[-2deg]">
               <Award className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="space-y-2">
               <h5 className="text-sm font-black text-indigo-600 uppercase tracking-widest italic">💡 Dica do Hub de Design</h5>
               <p className="text-xs text-text-secondary font-medium leading-relaxed max-w-2xl">
                 Para melhores resultados, utilize templates com resolução de <strong>2000x1414px (A4 Paisagem)</strong> e fundos neutros. Isso garante que as fontes variáveis de assinatura e nome fiquem legíveis em qualquer dispositivo.
               </p>
            </div>
         </div>
      </footer>
    </div>
  )
}
