import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'center_admin') redirect('/login')

  const rows = await sql`SELECT name FROM centers WHERE id = ${session.centerId!}`
  const center = rows[0]

  return (
    <div className="flex min-h-screen">
      <Sidebar role="center_admin" centerName={center?.name} userName={session.name}/>
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
