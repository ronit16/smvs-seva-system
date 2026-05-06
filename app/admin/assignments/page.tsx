'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Badge, { freqVariant } from '@/components/ui/Badge'
import Modal, { ModalField, selectClass } from '@/components/ui/Modal'
import { Link2, CheckCircle } from 'lucide-react'

export default function AssignmentsPage() {
  const [sevas, setSevas]     = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [tab, setTab]         = useState<'all' | 'pending' | 'done'>('all')
  const [loading, setLoading] = useState(true)
  const [assigningSeva, setAssigningSeva] = useState<any | null>(null)

  const [selLeader, setSelLeader]   = useState('')
  const [selMembers, setSelMembers] = useState<string[]>([])
  const [saving, setSaving]         = useState(false)

  const load = useCallback(async () => {
    const [sRes, mRes] = await Promise.all([
      fetch('/api/sevas'),
      fetch('/api/members'),
    ])
    const [sData, mData] = await Promise.all([sRes.json(), mRes.json()])
    setSevas(sData.data || [])
    setMembers(mData.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openAssign(seva: any) {
    const leader  = seva.assignments?.find((a: any) => a.role === 'leader')
    const mems    = seva.assignments?.filter((a: any) => a.role === 'member').map((a: any) => a.member_id) || []
    setSelLeader(leader?.member_id || '')
    setSelMembers(mems)
    setAssigningSeva(seva)
  }

  async function saveAssignment() {
    if (!selLeader) return toast.error('Please select a leader')
    setSaving(true)
    try {
      const res  = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sevaId: assigningSeva.id, leaderId: selLeader, memberIds: selMembers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Assignment saved! WhatsApp notifications sent 📱')
      setAssigningSeva(null)
      load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  function toggleMember(id: string) {
    setSelMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const filtered = sevas.filter(s => {
    const hasAssign = s.assignments?.length > 0
    const hasDone   = s.assignments?.some((a: any) => a.completions?.length > 0)
    if (tab === 'pending') return !hasAssign
    if (tab === 'done')    return hasDone
    return true
  })

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="font-cinzel text-xl font-bold" style={{color:'var(--maroon)'}}>Assignments</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Assign leaders and members to sevas. WhatsApp notifications sent automatically.</p>
      </div>

      <div className="flex gap-2 mb-5 bg-[var(--cream2)] p-1 rounded-xl border border-[var(--border)] w-fit">
        {(['all','pending','done'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all capitalize
              ${tab === t ? 'text-white' : 'text-[var(--text-muted)]'}`}
            style={tab === t ? {background:'var(--maroon)'} : {}}>
            {t === 'all' ? 'All' : t === 'pending' ? 'Unassigned' : 'Completed'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[var(--text-muted)]">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(seva => {
            const leader  = seva.assignments?.find((a: any) => a.role === 'leader')
            const mems    = seva.assignments?.filter((a: any) => a.role === 'member') || []
            const done    = seva.assignments?.some((a: any) => a.completions?.length > 0)
            const assigned = seva.assignments?.length > 0

            return (
              <div key={seva.id} className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[1px]" style={{color:'var(--gold)'}}>{seva.category?.name}</div>
                    <div className="font-cinzel text-sm font-bold mt-0.5" style={{color:'var(--maroon)'}}>{seva.name}</div>
                  </div>
                  {done
                    ? <Badge variant="success"><CheckCircle size={10} className="mr-1"/>Done</Badge>
                    : assigned
                      ? <Badge variant="assigned">Assigned</Badge>
                      : <Badge variant="pending">Unassigned</Badge>
                  }
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">{seva.description}</p>
                <Badge variant={freqVariant(seva.frequency)}>{seva.frequency}</Badge>

                {leader && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{color:'var(--gold)'}}>Leader</div>
                    <div className="text-sm font-semibold" style={{color:'var(--maroon)'}}>{leader.member?.name}</div>
                  </div>
                )}
                {mems.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)] mb-1">Members</div>
                    <div className="text-xs text-[var(--text-muted)]">{mems.map((m: any) => m.member?.name).join(', ')}</div>
                  </div>
                )}

                <button onClick={() => openAssign(seva)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-sm font-semibold"
                  style={{background:'linear-gradient(135deg,var(--maroon),var(--saffron-dark))'}}>
                  <Link2 size={13}/> {assigned ? 'Re-assign' : 'Assign Members'}
                </button>
              </div>
            )
          })}
          {!filtered.length && (
            <div className="col-span-3 py-16 text-center text-[var(--text-muted)]">No sevas match this filter.</div>
          )}
        </div>
      )}

      {/* Assignment Modal */}
      <Modal open={!!assigningSeva} onClose={() => setAssigningSeva(null)} title={`Assign: ${assigningSeva?.name}`}
        footer={<>
          <button onClick={() => setAssigningSeva(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={saveAssignment} disabled={saving}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{background:'linear-gradient(135deg,var(--maroon),var(--saffron-dark))'}}>
            {saving ? 'Saving…' : 'Save & Notify via WhatsApp 📱'}
          </button>
        </>}
      >
        {assigningSeva && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[var(--cream2)]">
              <div className="font-bold text-sm" style={{color:'var(--maroon)'}}>{assigningSeva.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{assigningSeva.description}</div>
            </div>

            <ModalField label="Leader (1 person) *">
              <select value={selLeader} onChange={e => setSelLeader(e.target.value)} className={selectClass}>
                <option value="">Select Leader</option>
                {members.map(m => <option key={m.global_id} value={m.global_id}>{m.name}</option>)}
              </select>
            </ModalField>

            <ModalField label="Members (select one or more)">
              <div className="border border-[var(--border)] rounded-xl p-3 max-h-48 overflow-y-auto bg-[#FAFAFA]">
                {members.map(m => (
                  <label key={m.global_id} className="flex items-center gap-2 py-1.5 px-1 cursor-pointer text-sm hover:bg-[var(--cream2)] rounded-lg">
                    <input type="checkbox" checked={selMembers.includes(m.global_id)} onChange={() => toggleMember(m.global_id)}
                      className="accent-[var(--maroon)]"/>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{m.global_id}</span>
                  </label>
                ))}
              </div>
            </ModalField>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
              📱 A WhatsApp message will be sent to the leader and all selected members on save.
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
