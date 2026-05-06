'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

type LoginRole = 'superadmin' | 'admin' | 'member'

const CENTERS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Ahmedabad Center' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Surat Center' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Mumbai Center' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Rajkot Center' },
]

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>('superadmin')
  const [loading, setLoading] = useState(false)

  // Super Admin fields
  const [saEmail, setSaEmail]  = useState('')
  const [saPass,  setSaPass]   = useState('')

  // Center Admin fields
  const [aCenter, setACenter] = useState(CENTERS[0].id)
  const [aEmail,  setAEmail]  = useState('')
  const [aPass,   setAPass]   = useState('')

  // Member field
  const [memberId, setMemberId] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const body =
        role === 'superadmin' ? { role, email: saEmail, password: saPass } :
        role === 'admin'      ? { role, email: aEmail, password: aPass, centerId: aCenter } :
                                { role, globalId: memberId }

      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      toast.success('Jai Swaminarayan 🙏')
      if (role === 'superadmin') window.location.href = '/super-admin'
      else if (role === 'admin') window.location.href = '/admin'
      else                       window.location.href = '/member'
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-gradient min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{backgroundImage:'repeating-linear-gradient(45deg,#FFD700 0,#FFD700 1px,transparent 0,transparent 50%)',backgroundSize:'30px 30px'}}
      />
      <div className="absolute text-[180px] opacity-[0.05] text-yellow-300 font-cinzel select-none pointer-events-none"
        style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}>ॐ</div>

      <div className="bg-[rgba(255,252,245,0.97)] rounded-[20px] p-12 w-full max-w-md shadow-2xl border border-[rgba(201,136,13,0.3)] relative z-10 animate-fadeup">
        {/* Logo */}
        <div className="text-center mb-8">
          <svg width="60" height="48" viewBox="0 0 60 48" className="mx-auto mb-4">
            <path d="M30 44 C20 32 4 28 4 16 C4 10 10 6 18 10 C22 12 26 16 30 22" fill="#C9880D" opacity="0.7"/>
            <path d="M30 44 C40 32 56 28 56 16 C56 10 50 6 42 10 C38 12 34 16 30 22" fill="#C9880D" opacity="0.7"/>
            <path d="M30 44 C24 30 12 24 14 12 C16 6 24 6 28 14 C29 16 30 20 30 24" fill="#E05D00" opacity="0.8"/>
            <path d="M30 44 C36 30 48 24 46 12 C44 6 36 6 32 14 C31 16 30 20 30 24" fill="#E05D00" opacity="0.8"/>
            <path d="M30 44 C28 30 26 18 30 8 C34 18 32 30 30 44" fill="#8B1A1A" opacity="0.9"/>
            <circle cx="30" cy="8" r="4" fill="#FFD700"/>
          </svg>
          <h1 className="font-cinzel text-xl font-bold text-maroon-500">SMVS Swaminarayan Sanstha</h1>
          <p className="text-xs text-[var(--text-muted)] tracking-[2px] uppercase mt-1">Seva Management System</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 mb-6 bg-[var(--cream2)] p-1 rounded-xl border border-[var(--border)]">
          {(['superadmin','admin','member'] as LoginRole[]).map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all
                ${role === r
                  ? 'bg-maroon-500 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              style={role === r ? {background:'var(--maroon)'} : {}}
            >
              {r === 'superadmin' ? 'Super Admin' : r === 'admin' ? 'Center Admin' : 'Member'}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {role === 'superadmin' && (<>
            <Field label="Email">
              <input type="email" required value={saEmail} onChange={e=>setSaEmail(e.target.value)}
                placeholder="superadmin@smvs.org" className="smvs-input"/>
            </Field>
            <Field label="Password">
              <input type="password" required value={saPass} onChange={e=>setSaPass(e.target.value)}
                placeholder="Password" className="smvs-input"/>
            </Field>
          </>)}

          {role === 'admin' && (<>
            <Field label="Center">
              <select value={aCenter} onChange={e=>setACenter(e.target.value)} className="smvs-input">
                {CENTERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Admin Email">
              <input type="email" required value={aEmail} onChange={e=>setAEmail(e.target.value)}
                placeholder="admin@smvs.org" className="smvs-input"/>
            </Field>
            <Field label="Password">
              <input type="password" required value={aPass} onChange={e=>setAPass(e.target.value)}
                placeholder="Password" className="smvs-input"/>
            </Field>
          </>)}

          {role === 'member' && (
            <Field label="Global ID">
              <input required value={memberId} onChange={e=>setMemberId(e.target.value.toUpperCase())}
                placeholder="e.g. AHM001" className="smvs-input text-lg tracking-widest font-semibold"/>
            </Field>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white text-[15px] tracking-wide transition-opacity disabled:opacity-60 mt-2"
            style={{background:'linear-gradient(135deg,var(--maroon),var(--saffron-dark))'}}>
            {loading ? 'Signing in…' : '🙏 Enter System'}
          </button>
        </form>

        <div className="gold-divider my-5"/>
        <p className="text-center text-xs text-[var(--text-light)] leading-relaxed" style={{color:'var(--text-muted)'}}>
          SMVS Swaminarayan Sanstha — Seva Management System<br/>
          All data is secured and center-isolated.
        </p>
      </div>

    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-[0.8px] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
