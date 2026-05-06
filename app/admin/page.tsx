import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import StatCard from '@/components/ui/StatCard'
import Badge, { freqVariant } from '@/components/ui/Badge'
import { CheckCircle, Users, Heart, Clock } from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'center_admin') redirect('/login')

  const cid = session.centerId!

  const [
    { count: memberCount },
    { count: sevaCount },
    { count: assignCount },
    { count: compCount },
    { data: recentComps },
    { data: sevas },
  ] = await Promise.all([
    supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).eq('center_id', cid),
    supabaseAdmin.from('sevas').select('*', { count: 'exact', head: true }).eq('center_id', cid).eq('active', true),
    supabaseAdmin.from('seva_assignments').select('*', { count: 'exact', head: true }).eq('center_id', cid),
    supabaseAdmin.from('seva_completions').select('*', { count: 'exact', head: true }).eq('center_id', cid),
    supabaseAdmin.from('seva_completions')
      .select('*, member:members(name), seva:sevas(name)')
      .eq('center_id', cid)
      .order('created_at', { ascending: false })
      .limit(6),
    supabaseAdmin.from('sevas')
      .select('*, category:seva_categories(name), assignments:seva_assignments(id)')
      .eq('center_id', cid)
      .eq('active', true)
      .limit(8),
  ])

  const pendingCount = (assignCount || 0) - (compCount || 0)

  return (
    <div className="p-7 flex-1">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-cinzel text-2xl font-bold" style={{color:'var(--maroon)'}}>Dashboard</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
          Welcome back, {session.name}. Jai Swaminarayan 🙏
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard value={compCount ?? 0}   label="Completed Sevas"  color="orange" icon={<CheckCircle size={20} className="text-orange-500"/>}/>
        <StatCard value={memberCount ?? 0} label="Total Members"    color="maroon" icon={<Users size={20} className="text-red-700"/>}/>
        <StatCard value={sevaCount ?? 0}   label="Active Sevas"     color="green"  icon={<Heart size={20} className="text-green-600"/>}/>
        <StatCard value={Math.max(0, pendingCount)} label="Pending Sevas" color="blue" icon={<Clock size={20} className="text-blue-600"/>}/>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Completions */}
        <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-cinzel text-sm font-semibold" style={{color:'var(--maroon)'}}>Recent Completions</h2>
          </div>
          <table className="w-full">
            <thead className="bg-[var(--cream2)]">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">Member</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">Seva</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">Date</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">Remark</th>
              </tr>
            </thead>
            <tbody>
              {recentComps?.map(c => (
                <tr key={c.id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                  <td className="px-5 py-3 text-sm font-semibold">{(c.member as any)?.name || '—'}</td>
                  <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{(c.seva as any)?.name || '—'}</td>
                  <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{c.completed_date}</td>
                  <td className="px-5 py-3">{c.admin_remark
                    ? <span className="text-xs text-green-700 font-medium">✓ Added</span>
                    : <Badge variant="pending">Pending</Badge>}
                  </td>
                </tr>
              ))}
              {!recentComps?.length && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No completions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Seva Status */}
        <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h2 className="font-cinzel text-sm font-semibold" style={{color:'var(--maroon)'}}>Seva Status</h2>
          </div>
          <div className="p-5 space-y-4">
            {sevas?.map(s => {
              const assigned = (s.assignments as any[])?.length || 0
              return (
                <div key={s.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{s.name}</span>
                      <Badge variant={freqVariant(s.frequency)}>{s.frequency}</Badge>
                    </div>
                    <span className="text-xs font-semibold" style={{color:'var(--maroon)'}}>
                      {assigned} assigned
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--cream2)] rounded-full overflow-hidden">
                    <div className="h-full progress-fill rounded-full" style={{width: assigned > 0 ? '100%' : '0%'}}/>
                  </div>
                </div>
              )
            })}
            {!sevas?.length && (
              <p className="text-center text-sm py-8 text-[var(--text-muted)]">No sevas created yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
