'use client'
import { useEffect, useState } from 'react'
import Badge, { freqVariant } from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import { CheckCircle, Users, Heart, MessageSquare } from 'lucide-react'

export default function GlobalReportsPage() {
  const [completions, setCompletions] = useState<any[]>([])
  const [centers, setCenters]         = useState<any[]>([])
  const [centerFilter, setCenterFilter] = useState('all')
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/completions').then(r => r.json()),
      fetch('/api/centers').then(r => r.json()),
    ]).then(([c, ctr]) => {
      setCompletions(c.data || [])
      setCenters(ctr.data || [])
      setLoading(false)
    })
  }, [])

  const filtered = centerFilter === 'all'
    ? completions
    : completions.filter(c => c.center_id === centerFilter)

  const remarkCount = filtered.filter(c => c.admin_remark).length

  // Per-center breakdown
  const centerBreakdown = centers.map(ctr => ({
    ...ctr,
    comps: completions.filter(c => c.center_id === ctr.id).length,
    remarks: completions.filter(c => c.center_id === ctr.id && c.admin_remark).length,
  }))

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="font-cinzel text-xl font-bold" style={{ color: 'var(--maroon)' }}>Global Reports</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Aggregated seva data across all SMVS centers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard value={completions.length} label="Total Completions" color="orange" icon={<CheckCircle size={20} className="text-orange-500" />} />
        <StatCard value={new Set(completions.map(c => c.member_id)).size} label="Active Members" color="maroon" icon={<Users size={20} className="text-red-700" />} />
        <StatCard value={centers.length} label="Centers" color="green" icon={<Heart size={20} className="text-green-600" />} />
        <StatCard value={completions.filter(c => c.admin_remark).length} label="Sant Remarks" color="blue" icon={<MessageSquare size={20} className="text-blue-600" />} />
      </div>

      {/* Center breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {centerBreakdown.map(ctr => (
          <div key={ctr.id} className="bg-white border border-[rgba(212,166,98,0.3)] rounded-2xl p-4">
            <div className="font-cinzel text-sm font-bold mb-2" style={{ color: 'var(--maroon)' }}>{ctr.name}</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--saffron)' }}>{ctr.comps}</div>
            <div className="text-xs text-[var(--text-muted)]">completions</div>
            <div className="text-xs mt-1 text-green-700 font-medium">{ctr.remarks} remarks</div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
          <h2 className="font-cinzel text-sm font-semibold flex-1" style={{ color: 'var(--maroon)' }}>All Completions</h2>
          <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)}
            className="px-3 py-1.5 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--saffron)] bg-[#FAFAFA]">
            <option value="all">All Centers</option>
            {centers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-xs text-[var(--text-muted)]">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--cream2)]">
              <tr>
                {['Member', 'Seva', 'Category', 'Center', 'Freq', 'Date', 'Photo', 'Sant Remark'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.7px] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">Loading…</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sm">{c.member?.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{c.member_id}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{c.seva?.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--gold)' }}>{c.seva?.category?.name}</td>
                  <td className="px-4 py-3"><Badge variant="center">{centers.find(x => x.id === c.center_id)?.name || c.center_id}</Badge></td>
                  <td className="px-4 py-3">{c.seva && <Badge variant={freqVariant(c.seva.frequency)}>{c.seva.frequency}</Badge>}</td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{c.completed_date}</td>
                  <td className="px-4 py-3">{c.proof_url ? <span className="text-xs text-green-700 font-medium">✓ Yes</span> : <span className="text-xs text-[var(--text-muted)]">—</span>}</td>
                  <td className="px-4 py-3 text-xs italic text-[var(--text-muted)] max-w-[160px] truncate">{c.admin_remark || '—'}</td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-sm text-[var(--text-muted)]">No completions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
