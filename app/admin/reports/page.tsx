'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Badge, { freqVariant } from '@/components/ui/Badge'
import Modal, { ModalField, textareaClass } from '@/components/ui/Modal'

export default function ReportsPage() {
  const [completions, setCompletions] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [tab, setTab] = useState<'completions' | 'pending' | 'members'>('completions')
  const [loading, setLoading] = useState(true)

  const [remarkComp, setRemarkComp]       = useState<any | null>(null)
  const [remarkText, setRemarkText]       = useState('')
  const [remarkFile, setRemarkFile]       = useState<File | null>(null)
  const [savingRemark, setSavingRemark]   = useState(false)

  const load = useCallback(async () => {
    const [cRes, aRes] = await Promise.all([
      fetch('/api/completions'),
      fetch('/api/assignments'),
    ])
    const [cData, aData] = await Promise.all([cRes.json(), aRes.json()])
    setCompletions(cData.data || [])
    setAssignments(aData.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openRemark(comp: any) {
    setRemarkComp(comp); setRemarkText(comp.admin_remark || ''); setRemarkFile(null)
  }

  async function saveRemark() {
    if (!remarkComp) return
    if (!remarkText.trim()) return toast.error('Please enter a remark')
    setSavingRemark(true)
    try {
      let remark_media_url: string | null = null
      let remark_media_public_id: string | null = null

      if (remarkFile) {
        const fd = new FormData()
        fd.append('file', remarkFile)
        fd.append('folder', 'sant-remarks')
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const up    = await upRes.json()
        if (!upRes.ok) throw new Error(up.error)
        remark_media_url       = up.data.url
        remark_media_public_id = up.data.publicId
      }

      const res = await fetch(`/api/completions/${remarkComp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_remark: remarkText, remark_media_url, remark_media_public_id }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Sant remark saved! 🙏')
      setRemarkComp(null); load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSavingRemark(false)
    }
  }

  // Pending: assignments without any completion
  const completionAssignIds = new Set(completions.map(c => c.assignment_id))
  const pending = assignments.filter(a => !completionAssignIds.has(a.id))

  // Member report
  const memberMap: Record<string, { name: string; assigned: number; completed: number }> = {}
  assignments.forEach(a => {
    const id = a.member?.global_id
    if (!id) return
    if (!memberMap[id]) memberMap[id] = { name: a.member.name, assigned: 0, completed: 0 }
    memberMap[id].assigned++
    if (completionAssignIds.has(a.id)) memberMap[id].completed++
  })

  return (
    <div className="p-7">
      <div className="mb-6">
        <h1 className="font-cinzel text-xl font-bold" style={{color:'var(--maroon)'}}>Reports & Sant Remarks</h1>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">Track completions, pending sevas, and add Sant's blessings.</p>
      </div>

      <div className="flex gap-2 mb-5 bg-[var(--cream2)] p-1 rounded-xl border border-[var(--border)] w-fit">
        {[['completions','Completions'],['pending','Pending Sevas'],['members','Member Report']] .map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab===k?'text-white':'text-[var(--text-muted)]'}`}
            style={tab===k ? {background:'var(--maroon)'} : {}}>
            {l}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-20 text-[var(--text-muted)]">Loading…</div> : (<>

        {/* COMPLETIONS */}
        {tab === 'completions' && (
          <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--cream2)]">
                <tr>
                  {['Member','Seva','Category','Frequency','Date','Photo','Suchan','Sant Remark','Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.7px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completions.map(c => (
                  <tr key={c.id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm">{c.member?.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{c.member_id}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{c.seva?.name}</td>
                    <td className="px-4 py-3 text-xs" style={{color:'var(--gold)'}}>{c.seva?.category?.name}</td>
                    <td className="px-4 py-3">{c.seva && <Badge variant={freqVariant(c.seva.frequency)}>{c.seva.frequency}</Badge>}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{c.completed_date}</td>
                    <td className="px-4 py-3">
                      {c.proof_url
                        ? <div className="relative w-10 h-10 rounded-lg overflow-hidden"><Image src={c.proof_url} alt="proof" fill className="object-cover"/></div>
                        : <span className="text-xs text-[var(--text-muted)]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] italic max-w-[120px] truncate">{c.user_suchan || '—'}</td>
                    <td className="px-4 py-3 max-w-[150px]">
                      {c.admin_remark
                        ? <span className="text-xs font-semibold" style={{color:'var(--maroon)'}}>{c.admin_remark}</span>
                        : <Badge variant="pending">Pending</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openRemark(c)}
                        className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold whitespace-nowrap"
                        style={{background:'linear-gradient(135deg,var(--gold),#E8A020)'}}>
                        ✍ {c.admin_remark ? 'Edit' : 'Add'} Remark
                      </button>
                    </td>
                  </tr>
                ))}
                {!completions.length && (
                  <tr><td colSpan={9} className="px-5 py-16 text-center text-sm text-[var(--text-muted)]">No completions recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PENDING */}
        {tab === 'pending' && (
          <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-x-auto">
            {!pending.length
              ? <div className="py-16 text-center text-green-700 font-semibold">🙏 All sevas completed! Jai Swaminarayan!</div>
              : <table className="w-full">
                  <thead className="bg-[var(--cream2)]">
                    <tr>
                      {['Seva','Category','Member','Role','Frequency','Assigned Date'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.7px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map(a => (
                      <tr key={a.id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                        <td className="px-5 py-3 font-semibold text-sm">{a.seva?.name}</td>
                        <td className="px-5 py-3 text-xs" style={{color:'var(--gold)'}}>{a.seva?.category?.name}</td>
                        <td className="px-5 py-3 text-sm">{a.member?.name}</td>
                        <td className="px-5 py-3"><Badge variant={a.role === 'leader' ? 'leader' : 'member'}>{a.role}</Badge></td>
                        <td className="px-5 py-3">{a.seva && <Badge variant={freqVariant(a.seva.frequency)}>{a.seva.frequency}</Badge>}</td>
                        <td className="px-5 py-3 text-xs text-[var(--text-muted)]">{a.assigned_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        )}

        {/* MEMBER REPORT */}
        {tab === 'members' && (
          <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--cream2)]">
                <tr>
                  {['Member','Assigned','Completed','Pending','Completion Rate'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.7px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(memberMap).map(([id, m]) => {
                  const rate = m.assigned > 0 ? Math.round((m.completed / m.assigned) * 100) : 0
                  return (
                    <tr key={id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                      <td className="px-5 py-3 font-semibold text-sm">{m.name}</td>
                      <td className="px-5 py-3 text-sm text-center">{m.assigned}</td>
                      <td className="px-5 py-3 text-sm text-center text-green-700 font-bold">{m.completed}</td>
                      <td className="px-5 py-3 text-sm text-center text-orange-600">{m.assigned - m.completed}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--cream2)] rounded-full overflow-hidden">
                            <div className="h-full progress-fill rounded-full" style={{width:`${rate}%`}}/>
                          </div>
                          <span className="text-xs font-bold w-10 text-right" style={{color:'var(--maroon)'}}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </>)}

      {/* Sant Remark Modal */}
      <Modal open={!!remarkComp} onClose={() => setRemarkComp(null)} title="Add Sant Remark"
        footer={<>
          <button onClick={() => setRemarkComp(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={saveRemark} disabled={savingRemark}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{background:'linear-gradient(135deg,var(--gold),#E8A020)'}}>
            {savingRemark ? 'Saving…' : 'Save Remark 🙏'}
          </button>
        </>}
      >
        {remarkComp && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-[var(--cream2)]">
              <div className="font-bold text-sm" style={{color:'var(--maroon)'}}>{remarkComp.seva?.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">By {remarkComp.member?.name} on {remarkComp.completed_date}</div>
              {remarkComp.user_suchan && <div className="text-xs italic mt-1.5">"{remarkComp.user_suchan}"</div>}
            </div>
            {remarkComp.proof_url && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden">
                <Image src={remarkComp.proof_url} alt="proof" fill className="object-cover"/>
              </div>
            )}
            <ModalField label="Sant Remark / Blessing *">
              <textarea value={remarkText} onChange={e => setRemarkText(e.target.value)}
                className={textareaClass} placeholder="Enter Sant's blessings or remarks…"/>
            </ModalField>
            <ModalField label="Attach Media (Photo/Video)" hint="Auto-deleted after 30 days. Remark text is kept permanently.">
              <label className="block border-2 border-dashed border-[var(--border-gold)] rounded-xl p-4 text-center cursor-pointer bg-[var(--gold-lighter)] hover:bg-yellow-50">
                <div className="text-sm text-[var(--text-muted)]">{remarkFile ? remarkFile.name : '📎 Tap to attach photo or video'}</div>
                <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setRemarkFile(e.target.files?.[0] || null)}/>
              </label>
            </ModalField>
          </div>
        )}
      </Modal>
    </div>
  )
}
