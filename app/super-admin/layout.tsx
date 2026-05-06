import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar role="super_admin" userName={session.name}/>
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
