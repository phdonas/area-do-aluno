'use client'

import React, { useState } from 'react'
import { Power, Trash2, Pencil } from 'lucide-react'
import { toggleAtivo, deletarCupom } from '@/app/(protected)/admin/cupons/actions'
import CouponModal, { Cupom } from './CouponModal'

interface CouponActionsProps {
  cupom: Cupom
}

export default function CouponActions({ cupom }: CouponActionsProps) {
  const { id, ativo } = cupom
  const [editOpen, setEditOpen] = useState(false)

  const handleToggle = async () => {
    const res = await toggleAtivo(id, ativo)
    if (res?.error) alert(res.error)
  }

  const handleDelete = async () => {
    if (confirm('Deseja excluir este cupom permanentemente?')) {
      const res = await deletarCupom(id)
      if (res?.error) alert(res.error)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
      <button
        onClick={() => setEditOpen(true)}
        className="p-3 text-text-muted hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <CouponModal cupom={cupom} open={editOpen} onOpenChange={setEditOpen} />

      <button
        onClick={handleToggle}
        className={`p-3 rounded-xl transition-all ${ativo ? 'text-text-muted hover:text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
        title={ativo ? 'Desativar' : 'Ativar'}
      >
        <Power className="w-4 h-4" />
      </button>

      <button
        onClick={handleDelete}
        className="p-3 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        title="Excluir"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
