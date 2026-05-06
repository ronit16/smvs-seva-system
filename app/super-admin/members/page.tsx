'use client'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import { Search } from 'lucide-react'

export default function AllMembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [search, setSearch]   = useState('')
  const [centerFilter, setCenterFilter] = useState('all')
  const [centers, setCenters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/members').then(r => r.json()),
      fetch('/api/centers').then(r => r.json()),
    ]).then(([m, c]) => {
      setMembers(m.data || [])
      setCenters(c.data || [])
      setLoading(false)
    })
  }, [])

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.global_id.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
    const matchCenter = centerFilter === 'all' || m.center_id === centerFilter
    return matchSearch && matchCenter
  })

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="font-cinzel text-xl font-bold" style={{ color: 'var(--maroon)' }}>All Members</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">{members.length} members across all centers</p>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, ID, phone…"
              className="pl-9 pr-3 py-2 border border-[var(--border)] rounded-xl text-sm w-full outline-none focus:border-[var(--saffron)] bg-[#FAFAFA]" />
          </div>
          <select value={centerFilter} onChange={e => setCenterFilter(e.target.value)}
            className="px-3 py-2 border border-[var(--border)] rounded-xl text-sm outline-none focus:border-[var(--saffron)] bg-[#FAFAFA]">
            <option value="all">All Centers</option>
            {centers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <span className="text-xs text-[var(--text-muted)]">{filtered.length} results</span>
        </div>

        <table className="w-full">
          <thead className="bg-[var(--cream2)]">
            <tr>
              {['Global ID', 'Name', 'Phone', 'Center', 'Status'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">Loading…</td></tr>
            ) : filtered.map(m => (
              <tr key={m.global_id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                <td className="px-5 py-3">
                  <code className="text-xs bg-[var(--cream2)] px-2 py-1 rounded-md font-mono">{m.global_id}</code>
                </td>
                <td className="px-5 py-3 font-semibold text-sm">{m.name}</td>
                <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{m.phone}</td>
                <td className="px-5 py-3">
                  <Badge variant="center">{m.center?.name || m.center_id}</Badge>
                </td>
                <td className="px-5 py-3">
                  {m.active
                    ? <Badge variant="success">Active</Badge>
                    : <Badge variant="error">Inactive</Badge>}
                </td>
              </tr>
            ))}
            {!loading && !filtered.length && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
