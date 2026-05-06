import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'center_admin') redirect('/login')

  const { data: center } = await supabaseAdmin
    .from('centers')
    .select('name')
    .eq('id', session.centerId!)
    .single()

  return (
    <div className="flex min-h-screen">
      <Sidebar role="center_admin" centerName={center?.name} userName={session.name}/>
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
