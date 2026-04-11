'use client'

import React, { useRef, useState } from 'react'
import { Upload, Loader2, FileSpreadsheet } from 'lucide-react'
import { importarCSVContatos } from '@/app/(protected)/admin/convites/actions'

export default function ImportCsvButton() {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await importarCSVContatos(formData)

    if (res.error) {
      alert(res.error)
    } else {
      alert(`Importação concluída: ${res.successCount} convites gerados com sucesso!`)
    }
    
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      <input 
        type="file" 
        accept=".csv"
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <><FileSpreadsheet className="w-3.5 h-3.5" /> Importar CSV</>
        )}
      </button>
    </>
  )
}
