'use client'

import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Ban, Trash2 } from 'lucide-react'
import { revogarConvite, excluirConvite } from '@/app/(protected)/admin/convites/actions'

interface ConviteActionsProps {
  id: string
  usado: boolean
  revogado: boolean
}

export default function ConviteActions({ id, usado, revogado }: ConviteActionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (usado) return null

  const handleRevogar = async () => {
    setOpen(false)
    if (!confirm('Revogar este convite? O link deixará de funcionar para novos cadastros.')) return
    const res = await revogarConvite(id)
    if (res?.error) alert(res.error)
  }

  const handleExcluir = async () => {
    setOpen(false)
    if (!confirm('Excluir este convite permanentemente?')) return
    const res = await excluirConvite(id)
    if (res?.error) alert(res.error)
  }

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-3 hover:bg-black/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-4 h-4 text-text-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 bg-surface border border-border-custom rounded-2xl shadow-xl overflow-hidden">
          {!revogado && (
            <button
              onClick={handleRevogar}
              className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-text-primary hover:bg-black/5 transition-colors"
            >
              <Ban className="w-4 h-4 text-amber-500" /> Revogar
            </button>
          )}
          <button
            onClick={handleExcluir}
            className="w-full flex items-center gap-3 px-5 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Excluir
          </button>
        </div>
      )}
    </div>
  )
}
