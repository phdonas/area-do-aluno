import { redirect } from 'next/navigation'
import { ensureAccess } from '@/lib/auth-check'
import { AdminHeader } from './AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await ensureAccess().catch(() => null)
  
  if (!access) {
    redirect('/catalogo')
  }

  return (
    <>
      <AdminHeader />
      {children}
    </>
  )
}
