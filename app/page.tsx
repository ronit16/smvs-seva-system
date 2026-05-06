import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function RootPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'super_admin')  redirect('/super-admin')
  if (session.role === 'center_admin') redirect('/admin')
  if (session.role === 'member')       redirect('/member')
  redirect('/login')
}
