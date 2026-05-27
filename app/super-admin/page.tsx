import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import { CheckCircle, Users, Heart, Building2 } from 'lucide-react'
import type { Center } from '@/lib/types'

export default async function SuperAdminDashboard() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') redirect('/login')

  const [
    centers,
    [{ total_members }],
    [{ total_sevas }],
    [{ total_completions }],
    recentComps,
  ] = await Promise.all([
    sql`SELECT * FROM centers ORDER BY name`,
    sql`SELECT COUNT(*)::int AS total_members FROM members`,
    sql`SELECT COUNT(*)::int AS total_sevas FROM sevas WHERE active = true`,
    sql`SELECT COUNT(*)::int AS total_completions FROM seva_completions`,
    sql`
      SELECT
        sc.id, sc.admin_remark,
        sc.completed_date::text AS completed_date,
        json_build_object('name', m.name) AS member,
        json_build_object('name', sv.name) AS seva,
        json_build_object('name', c.name) AS center
      FROM seva_completions sc
      JOIN members m ON m.global_id = sc.member_id
      JOIN sevas sv ON sv.id = sc.seva_id
      JOIN centers c ON c.id = sc.center_id
      ORDER BY sc.created_at DESC
      LIMIT 8
    `,
  ])

  // Per-center stats
  const centerStats = await Promise.all(
    (centers as Center[]).map(async (c) => {
      const [
        [{ mc }],
        [{ sc }],
        [{ cc }],
        [{ ac }],
      ] = await Promise.all([
        sql`SELECT COUNT(*)::int AS mc FROM members WHERE center_id = ${c.id}`,
        sql`SELECT COUNT(*)::int AS sc FROM sevas WHERE center_id = ${c.id} AND active = true`,
        sql`SELECT COUNT(*)::int AS cc FROM seva_completions WHERE center_id = ${c.id}`,
        sql`SELECT COUNT(*)::int AS ac FROM seva_assignments WHERE center_id = ${c.id}`,
      ])
      return { center: c, members: mc || 0, sevas: sc || 0, completions: cc || 0, assignments: ac || 0 }
    })
  )

  return (
    <div className="p-7 flex-1">
      <div className="mb-7">
        <h1 className="font-cinzel text-2xl font-bold" style={{color:'var(--maroon)'}}>Super Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{color:'var(--text-muted)'}}>
          Global view — all SMVS centers. Jai Swaminarayan 🙏
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard value={total_completions ?? 0} label="Total Completions"  color="orange" icon={<CheckCircle size={20} className="text-orange-500"/>}/>
        <StatCard value={total_members ?? 0}     label="Total Members"      color="maroon" icon={<Users size={20} className="text-red-700"/>}/>
        <StatCard value={total_sevas ?? 0}       label="Active Sevas"       color="green"  icon={<Heart size={20} className="text-green-600"/>}/>
        <StatCard value={centers?.length ?? 0}   label="Active Centers"     color="blue"   icon={<Building2 size={20} className="text-blue-600"/>}/>
      </div>

      {/* Center cards */}
      <div className="mb-7">
        <h2 className="font-cinzel text-base font-semibold mb-4" style={{color:'var(--maroon)'}}>Center Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {centerStats.map(({ center, members, sevas, completions, assignments }) => {
            const pending = assignments - completions
            return (
              <div key={center.id} className="bg-white border border-[rgba(212,166,98,0.3)] rounded-2xl p-5 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold font-cinzel"
                    style={{background:'linear-gradient(135deg,var(--saffron),var(--gold))'}}>
                    {center.name[0]}
                  </div>
                  <div>
                    <div className="font-cinzel text-sm font-bold" style={{color:'var(--maroon)'}}>{center.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{center.location}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[['Members', members], ['Sevas', sevas], ['Done', completions]].map(([l, v]) => (
                    <div key={l as string} className="text-center py-2 rounded-xl" style={{background:'var(--cream2)'}}>
                      <div className="text-lg font-bold" style={{color:'var(--maroon)'}}>{v}</div>
                      <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-wide">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  {pending > 0
                    ? <div className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700">⚠ {pending} pending</div>
                    : <div className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700">✓ All on track</div>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent completions across all centers */}
      <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-cinzel text-sm font-semibold" style={{color:'var(--maroon)'}}>Recent Completions — All Centers</h2>
        </div>
        <table className="w-full">
          <thead className="bg-[var(--cream2)]">
            <tr>
              {['Member','Seva','Center','Date','Remark'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentComps?.map((c: any) => (
              <tr key={c.id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                <td className="px-5 py-3 text-sm font-semibold">{c.member?.name || '—'}</td>
                <td className="px-5 py-3 text-sm">{c.seva?.name || '—'}</td>
                <td className="px-5 py-3"><Badge variant="center">{c.center?.name || '—'}</Badge></td>
                <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{c.completed_date}</td>
                <td className="px-5 py-3 text-xs italic text-[var(--text-muted)] max-w-[160px] truncate">{c.admin_remark || '—'}</td>
              </tr>
            ))}
            {!recentComps?.length && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">No completions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
