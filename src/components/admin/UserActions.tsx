'use client'

import React, { useState } from 'react'
import { Shield, ShieldAlert, Trash2, Loader2, Briefcase, UserX } from 'lucide-react'
import { toggleAdmin, toggleStaff, deletarUsuario } from '@/app/(protected)/admin/usuarios/actions'

interface UserActionsProps {
  id: string
  isAdmin: boolean
  isStaff: boolean
  email: string
  isSelf: boolean
}

export default function UserActions({ id, isAdmin, isStaff, email, isSelf }: UserActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleToggleAdmin = async () => {
    if (isSelf) {
      alert('Você não pode remover suas próprias permissões Administrativas!')
      return
    }

    if (!confirm(`Deseja alterar as permissões de ADMINISTRADOR para ${email}?`)) return

    setLoading(true)
    const res = await toggleAdmin(id, isAdmin)
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  const handleToggleStaff = async () => {
    if (!confirm(`Deseja alterar as permissões de STAFF para ${email}?`)) return

    setLoading(true)
    const res = await toggleStaff(id, isStaff)
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (isSelf) {
      alert('Você não pode se auto-excluir!')
      return
    }

    if (!confirm(`TEM CERTEZA? Isso excluirá permanentemente a conta de ${email}.`)) return

    setLoading(true)
    const res = await deletarUsuario(id)
    if (res?.error) alert(res.error)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
      ) : (
        <>
          {/* BOTÃO ADMIN */}
          <button 
            onClick={handleToggleAdmin}
            className={`p-2 rounded-lg transition-all ${isAdmin ? 'bg-amber-100 text-amber-600' : 'text-text-muted hover:text-amber-500 hover:bg-amber-50'}`}
            title={isAdmin ? 'Remover Admin' : 'Tornar Admin'}
            disabled={isSelf}
          >
            {isAdmin ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          </button>

          {/* BOTÃO STAFF */}
          <button 
            onClick={handleToggleStaff}
            className={`p-2 rounded-lg transition-all ${isStaff ? 'bg-indigo-100 text-indigo-600' : 'text-text-muted hover:text-indigo-500 hover:bg-indigo-50'}`}
            title={isStaff ? 'Remover Staff' : 'Tornar Staff'}
            disabled={isSelf}
          >
            {isStaff ? <UserX className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={handleDelete}
            className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Excluir Usuário"
            disabled={isSelf}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  )
}
