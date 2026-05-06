'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Badge, { freqVariant } from '@/components/ui/Badge'
import Modal, { ModalField, inputClass, textareaClass } from '@/components/ui/Modal'
import { LogOut, Phone, Clock, CheckCircle2, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

interface Completion {
  id: string
  completed_date: string
  proof_url: string | null
  user_suchan: string | null
  admin_remark: string | null
  remark_media_url: string | null
}

interface Assignment {
  id: string
  role: 'leader' | 'member'
  seva: {
    id: string
    name: string
    description: string
    frequency: string
    category: { name: string }
  }
  member: { name: string; phone: string }
  completions: Completion[]
}

// Returns the completion that falls in the current period, or null if not yet done
function getCurrentPeriodCompletion(completions: Completion[], frequency: string): Completion | null {
  const now = new Date()

  for (const c of completions) {
    const date = new Date(c.completed_date + 'T00:00:00')

    if (frequency === 'daily') {
      if (date.toDateString() === now.toDateString()) return c
    } else if (frequency === 'weekly') {
      const dow = now.getDay() // 0 = Sunday
      const daysToMon = dow === 0 ? -6 : 1 - dow
      const monday = new Date(now)
      monday.setDate(now.getDate() + daysToMon)
      monday.setHours(0, 0, 0, 0)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)
      if (date >= monday && date <= sunday) return c
    } else if (frequency === 'monthly') {
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) return c
    } else {
      // one-time / custom — any completion counts
      if (completions.length > 0) return completions[0]
    }
  }
  return null
}

function getPeriodLabel(frequency: string): string {
  const now = new Date()
  if (frequency === 'daily') {
    return `Today · ${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
  }
  if (frequency === 'weekly') {
    const dow = now.getDay()
    const daysToMon = dow === 0 ? -6 : 1 - dow
    const mon = new Date(now); mon.setDate(now.getDate() + daysToMon)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    return `${fmt(mon)} – ${fmt(sun)}`
  }
  if (frequency === 'monthly') {
    return now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }
  return 'One-time seva'
}

export default function MemberPage() {
  const router = useRouter()
  const [me,          setMe]          = useState<any>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [leaders,     setLeaders]     = useState<Record<string, any>>({})
  const [loading,     setLoading]     = useState(true)

  const [completing,  setCompleting]  = useState<Assignment | null>(null)
  const [compDate,    setCompDate]    = useState(new Date().toISOString().split('T')[0])
  const [compSuchan,  setCompSuchan]  = useState('')
  const [compFile,    setCompFile]    = useState<File | null>(null)
  const [submitting,  setSubmitting]  = useState(false)

  const loadData = useCallback(async () => {
    const [meRes, assignRes] = await Promise.all([
      fetch('/api/auth/me'),
      fetch('/api/assignments'),
    ])
    const meData    = await meRes.json()
    const assignData = await assignRes.json()
    setMe(meData.data)
    const myAssigns: Assignment[] = assignData.data || []
    setAssignments(myAssigns)

    // Parallel fetch of leader info for member-role assignments
    const leaderMap: Record<string, any> = {}
    await Promise.all(
      myAssigns
        .filter(a => a.role === 'member')
        .map(async a => {
          const res = await fetch(`/api/assignments?sevaId=${a.seva.id}`)
          const d   = await res.json()
          const ldr = (d.data || []).find((x: any) => x.role === 'leader')
          if (ldr) leaderMap[a.seva.id] = ldr.member
        })
    )
    setLeaders(leaderMap)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function openComplete(a: Assignment) {
    setCompleting(a)
    setCompDate(new Date().toISOString().split('T')[0])
    setCompSuchan('')
    setCompFile(null)
  }

  async function submitCompletion() {
    if (!completing) return
    if (!compDate) return toast.error('Please select a date')
    setSubmitting(true)
    try {
      let proof_url: string | null = null
      let proof_public_id: string | null = null

      if (compFile) {
        const fd = new FormData()
        fd.append('file', compFile)
        fd.append('folder', 'seva-proofs')
        const upRes  = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error || 'Upload failed')
        proof_url       = upData.data.url
        proof_public_id = upData.data.publicId
      }

      const res = await fetch('/api/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: completing.id, completed_date: compDate, proof_url, proof_public_id, user_suchan: compSuchan }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Submission failed')
      }
      toast.success('Seva submitted! Jai Swaminarayan 🙏')
      setCompleting(null)
      loadData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const pending   = assignments.filter(a => !getCurrentPeriodCompletion(a.completions, a.seva.frequency))
  const completed = assignments.filter(a =>  getCurrentPeriodCompletion(a.completions, a.seva.frequency))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cream)' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">🙏</div>
          <div className="text-sm text-[var(--text-muted)]">Loading your sevas…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40" style={{ background: 'linear-gradient(135deg,#3D0C00,#6B1414,#A84400)' }}>
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="font-cinzel text-[10px] text-yellow-300/70 tracking-[2px] uppercase mb-0.5">
              SMVS Swaminarayan Sanstha
            </div>
            <div className="text-white font-semibold text-[15px] leading-snug truncate">
              Jai Swaminarayan, {me?.name?.split(' ')[0]}bhai! 🙏
            </div>
            <div className="text-white/40 text-[11px] mt-0.5">Global ID: {me?.userId}</div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-xl border border-white/20 text-white/60 hover:bg-white/10 transition-all shrink-0 mt-0.5">
            <LogOut size={11} /> Logout
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 border-t border-white/10">
          {[
            { v: assignments.length, l: 'Total',     color: 'text-white'        },
            { v: completed.length,   l: 'Completed', color: 'text-green-300'    },
            { v: pending.length,     l: 'Pending',   color: 'text-yellow-300'   },
          ].map(({ v, l, color }) => (
            <div key={l} className="py-2.5 text-center border-r border-white/10 last:border-r-0">
              <div className={`text-lg font-bold ${color}`}>{v}</div>
              <div className="text-[9px] text-white/40 uppercase tracking-widest">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="px-4 py-5 pb-10 max-w-lg mx-auto">

        {!assignments.length ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[rgba(212,166,98,0.3)] mt-2">
            <div className="text-5xl mb-4">🙏</div>
            <div className="font-semibold text-[var(--text)]">No sevas assigned yet</div>
            <div className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
              Your center admin will assign sevas to you soon.
            </div>
          </div>
        ) : (
          <>
            {/* Pending sevas */}
            {pending.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-orange-500" />
                  <h2 className="font-cinzel text-sm font-bold" style={{ color: 'var(--maroon)' }}>
                    Pending Sevas
                  </h2>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                    {pending.length} pending
                  </span>
                </div>
                {pending.map(a => (
                  <SevaCard key={a.id} a={a} leader={leaders[a.seva.id]}
                    currentCompletion={null} onComplete={() => openComplete(a)} />
                ))}
              </section>
            )}

            {/* Completed sevas */}
            {completed.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <h2 className="font-cinzel text-sm font-bold" style={{ color: 'var(--maroon)' }}>
                    Completed This Period
                  </h2>
                </div>
                {completed.map(a => (
                  <SevaCard key={a.id} a={a} leader={leaders[a.seva.id]}
                    currentCompletion={getCurrentPeriodCompletion(a.completions, a.seva.frequency)} />
                ))}
              </section>
            )}
          </>
        )}
      </div>

      {/* ── Completion Modal ── */}
      <Modal open={!!completing} onClose={() => setCompleting(null)} title="Mark Seva Complete"
        footer={<>
          <button onClick={() => setCompleting(null)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={submitCompletion} disabled={submitting}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
            {submitting ? 'Submitting…' : 'Submit 🙏'}
          </button>
        </>}>
        {completing && (
          <div className="space-y-4">
            {/* Seva summary */}
            <div className="p-3.5 rounded-xl bg-[var(--cream2)] border border-[var(--border)]">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--gold)' }}>
                {completing.seva.category.name}
              </div>
              <div className="font-bold text-sm mb-0.5" style={{ color: 'var(--maroon)' }}>{completing.seva.name}</div>
              {completing.seva.description && (
                <div className="text-xs text-[var(--text-muted)]">{completing.seva.description}</div>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <Calendar size={11} className="text-[var(--text-muted)]" />
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  Period: {getPeriodLabel(completing.seva.frequency)}
                </span>
              </div>
            </div>

            <ModalField label="Date of Completion *">
              <input type="date" value={compDate} onChange={e => setCompDate(e.target.value)} className={inputClass} />
            </ModalField>

            <ModalField label="Photo Proof" hint="Upload a clear photo as proof. Auto-deleted after 30 days.">
              <label className="block border-2 border-dashed border-[var(--border-gold)] rounded-xl p-5 text-center cursor-pointer bg-[var(--gold-lighter)] hover:bg-yellow-50 transition-colors">
                {compFile ? (
                  <div>
                    <div className="text-2xl mb-1">📎</div>
                    <div className="text-sm font-semibold text-[var(--text)]">{compFile.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">{(compFile.size / 1024).toFixed(0)} KB · tap to change</div>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">📸</div>
                    <div className="text-sm text-[var(--text-muted)]">Tap to upload photo or video</div>
                  </>
                )}
                <input type="file" accept="image/*,video/*" className="hidden"
                  onChange={e => setCompFile(e.target.files?.[0] || null)} />
              </label>
            </ModalField>

            <ModalField label="Personal Note (Optional)">
              <textarea value={compSuchan} onChange={e => setCompSuchan(e.target.value)}
                className={textareaClass} placeholder="Any personal note or observation…" />
            </ModalField>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ── Seva Card ──────────────────────────────────────────────────────────────
function SevaCard({
  a, leader, currentCompletion, onComplete,
}: {
  a: Assignment
  leader?: any
  currentCompletion: Completion | null
  onComplete?: () => void
}) {
  const isDone    = !!currentCompletion
  const [open, setOpen] = useState(!isDone) // pending cards start open

  return (
    <div className={`bg-white rounded-2xl overflow-hidden mb-4 border transition-shadow hover:shadow-md ${
      isDone ? 'border-green-200' : 'border-[rgba(212,166,98,0.5)]'
    }`}>
      {/* colour strip */}
      <div className={`h-1 ${isDone ? 'bg-green-400' : 'bg-gradient-to-r from-orange-400 to-yellow-400'}`} />

      {/* Always-visible header row — tap to expand/collapse */}
      <button className="w-full text-left px-4 pt-3.5 pb-3" onClick={() => setOpen(o => !o)}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 text-base mt-0.5
            ${isDone ? 'bg-green-500' : 'bg-gradient-to-br from-orange-500 to-red-800'}`}>
            {isDone ? '✓' : '🙏'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: 'var(--gold)' }}>
              {a.seva.category.name}
            </div>
            <div className="font-cinzel text-sm font-bold leading-snug mt-0.5 truncate" style={{ color: 'var(--maroon)' }}>
              {a.seva.name}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <Badge variant={freqVariant(a.seva.frequency)}>{a.seva.frequency}</Badge>
              {isDone
                ? <span className="text-[10px] font-semibold text-green-600">✓ Done this period</span>
                : <span className="text-[10px] font-semibold text-orange-500">⏳ {getPeriodLabel(a.seva.frequency)}</span>
              }
            </div>
          </div>
          <div className="text-[var(--text-muted)] shrink-0 mt-1">
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
        </div>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)] pt-3">

          {a.seva.description && (
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{a.seva.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-medium">Current Period</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{getPeriodLabel(a.seva.frequency)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)] font-medium">Your Role</span>
            <Badge variant={a.role === 'leader' ? 'leader' : 'member'}>
              {a.role === 'leader' ? '👑 Leader' : 'Member'}
            </Badge>
          </div>

          {/* Leader contact */}
          {leader && a.role === 'member' && (
            <div className="p-3 rounded-xl bg-[var(--cream2)] border border-[var(--border)]">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--gold)' }}>Leader</div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold truncate" style={{ color: 'var(--maroon)' }}>{leader.name}</span>
                <a href={`tel:${leader.phone}`}
                  className="flex items-center gap-1 text-sm font-semibold shrink-0" style={{ color: 'var(--saffron)' }}>
                  <Phone size={12} /> {leader.phone}
                </a>
              </div>
            </div>
          )}

          {/* Completion details when done */}
          {currentCompletion && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-medium">Completed On</span>
                <span className="text-sm font-semibold text-green-700">
                  {new Date(currentCompletion.completed_date + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>
              {currentCompletion.proof_url && (
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <Image src={currentCompletion.proof_url} alt="Proof" fill className="object-cover" />
                </div>
              )}
              {currentCompletion.user_suchan && (
                <p className="text-sm italic text-[var(--text-muted)] px-1">
                  "{currentCompletion.user_suchan}"
                </p>
              )}
              {currentCompletion.admin_remark && (
                <div className="p-3.5 rounded-xl border" style={{ background: 'var(--gold-lighter)', borderColor: 'rgba(201,136,13,0.3)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--gold)' }}>
                    🙏 Sant Remark
                  </div>
                  <div className="text-sm leading-relaxed italic" style={{ color: 'var(--text)' }}>
                    {currentCompletion.admin_remark}
                  </div>
                  {currentCompletion.remark_media_url && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mt-2">
                      <Image src={currentCompletion.remark_media_url} alt="Remark media" fill className="object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mark complete button */}
          {!isDone && onComplete && (
            <button onClick={onComplete}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold mt-1 active:opacity-80 transition-opacity"
              style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
              Mark as Completed 🙏
            </button>
          )}
        </div>
      )}
    </div>
  )
}
