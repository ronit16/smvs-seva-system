'use client'
import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Modal, { ModalField, inputClass } from '@/components/ui/Modal'
import { Plus, Pencil, Trash2, UserPlus, User, Eye, EyeOff } from 'lucide-react'

type Center   = { id: string; name: string; location: string | null; admin_name: string | null; created_at: string }
type AdminUser = { id: string; name: string; email: string; center_id: string }

const COLORS = [
  'from-orange-500 to-yellow-500',
  'from-red-700 to-orange-600',
  'from-purple-700 to-red-700',
  'from-green-600 to-teal-500',
]

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([])
  const [admins,  setAdmins]  = useState<AdminUser[]>([])

  // ── Center modal state ──
  const [centerModal,   setCenterModal]   = useState<'add' | 'edit' | null>(null)
  const [editingCenter, setEditingCenter] = useState<Center | null>(null)
  const [cName,  setCName]  = useState('')
  const [cLoc,   setCLoc]   = useState('')
  const [cAdmin, setCAdmin] = useState('')

  // ── Admin modal state ──
  const [adminModal,   setAdminModal]   = useState<'add' | 'edit' | null>(null)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [adminCenterId, setAdminCenterId] = useState('')
  const [aName,    setAName]    = useState('')
  const [aEmail,   setAEmail]   = useState('')
  const [aPass,    setAPass]    = useState('')
  const [aNewPass, setANewPass] = useState('')
  const [showPass, setShowPass] = useState(false)

  // ── Delete confirmations ──
  const [delCenter, setDelCenter] = useState<Center | null>(null)
  const [delAdmin,  setDelAdmin]  = useState<AdminUser | null>(null)

  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const [cRes, aRes] = await Promise.all([
      fetch('/api/centers'),
      fetch('/api/admin-users'),
    ])
    const [cJson, aJson] = await Promise.all([cRes.json(), aRes.json()])
    setCenters(cJson.data || [])
    setAdmins(aJson.data || [])
  }, [])

  useEffect(() => { load() }, [load])

  // ── Center handlers ──
  function openAddCenter() {
    setCName(''); setCLoc(''); setCAdmin(''); setCenterModal('add')
  }
  function openEditCenter(c: Center) {
    setEditingCenter(c); setCName(c.name); setCLoc(c.location || ''); setCAdmin(c.admin_name || '')
    setCenterModal('edit')
  }

  async function handleAddCenter() {
    if (!cName.trim()) return toast.error('Center name is required')
    setSaving(true)
    try {
      const res = await fetch('/api/centers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cName, location: cLoc, admin_name: cAdmin }),
      })
      const d = await res.json()
      if (!res.ok) return toast.error(d.error)
      toast.success('Center added!'); setCenterModal(null); load()
    } finally { setSaving(false) }
  }

  async function handleEditCenter() {
    if (!cName.trim() || !editingCenter) return toast.error('Center name is required')
    setSaving(true)
    try {
      const res = await fetch(`/api/centers/${editingCenter.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cName, location: cLoc, admin_name: cAdmin }),
      })
      const d = await res.json()
      if (!res.ok) return toast.error(d.error)
      toast.success('Center updated!'); setCenterModal(null); load()
    } finally { setSaving(false) }
  }

  async function handleDeleteCenter() {
    if (!delCenter) return
    setSaving(true)
    try {
      const res = await fetch(`/api/centers/${delCenter.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) return toast.error(d.error)
      toast.success('Center deleted'); setDelCenter(null); load()
    } finally { setSaving(false) }
  }

  // ── Admin handlers ──
  function openAddAdmin(centerId: string) {
    setAdminCenterId(centerId); setAName(''); setAEmail(''); setAPass(''); setShowPass(false)
    setAdminModal('add')
  }
  function openEditAdmin(a: AdminUser) {
    setEditingAdmin(a); setAdminCenterId(a.center_id); setAName(a.name); setAEmail(a.email)
    setANewPass(''); setShowPass(false); setAdminModal('edit')
  }

  async function handleAddAdmin() {
    if (!aName.trim() || !aEmail.trim() || !aPass) {
      return toast.error('Name, email, and password are required')
    }
    if (aPass.length < 8) return toast.error('Password must be at least 8 characters')
    setSaving(true)
    try {
      const res = await fetch('/api/admin-users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: aName, email: aEmail, password: aPass, center_id: adminCenterId }),
      })
      const d = await res.json()
      if (!res.ok) return toast.error(d.error)
      toast.success('Admin account created!'); setAdminModal(null); load()
    } finally { setSaving(false) }
  }

  async function handleEditAdmin() {
    if (!editingAdmin || !aName.trim() || !aEmail.trim()) {
      return toast.error('Name and email are required')
    }
    if (aNewPass && aNewPass.length < 8) return toast.error('New password must be at least 8 characters')
    setSaving(true)
    try {
      const body: Record<string, string> = { name: aName, email: aEmail, center_id: adminCenterId }
      if (aNewPass) body.password = aNewPass
      const res = await fetch(`/api/admin-users/${editingAdmin.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) return toast.error(d.error)
      toast.success('Admin updated!'); setAdminModal(null); load()
    } finally { setSaving(false) }
  }

  async function handleDeleteAdmin() {
    if (!delAdmin) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin-users/${delAdmin.id}`, { method: 'DELETE' })
      const d = await res.json()
      if (!res.ok) return toast.error(d.error)
      toast.success('Admin account removed'); setDelAdmin(null); load()
    } finally { setSaving(false) }
  }

  const centerAdmins = (centerId: string) => admins.filter(a => a.center_id === centerId)

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cinzel text-xl font-bold" style={{ color: 'var(--maroon)' }}>All Centers</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{centers.length} SMVS Satsang centers registered</p>
        </div>
        <button onClick={openAddCenter}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
          <Plus size={16} /> Add Center
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {centers.map((c, i) => {
          const cas = centerAdmins(c.id)
          return (
            <div key={c.id} className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden hover:shadow-lg transition-all">
              <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
              <div className="p-5">
                {/* Header row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold font-cinzel bg-gradient-to-br ${COLORS[i % COLORS.length]}`}>
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-cinzel text-sm font-bold truncate" style={{ color: 'var(--maroon)' }}>{c.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{c.location || 'No location set'}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditCenter(c)} title="Edit center"
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--saffron)] hover:text-[var(--saffron)] transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDelCenter(c)} title="Delete center"
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Admins section */}
                <div className="border-t border-[var(--border)] pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                      Center Admin{cas.length !== 1 ? 's' : ''}
                    </span>
                    <button onClick={() => openAddAdmin(c.id)}
                      className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors"
                      style={{ color: 'var(--maroon)', background: 'var(--cream2)' }}>
                      <UserPlus size={10} /> Add Admin
                    </button>
                  </div>

                  {cas.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] italic py-1">No admin assigned yet</p>
                  ) : (
                    <div className="space-y-1.5">
                      {cas.map(a => (
                        <div key={a.id} className="flex items-center gap-2 bg-[var(--cream2)] rounded-xl px-3 py-2">
                          <User size={12} className="text-[var(--text-muted)] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{a.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)] truncate">{a.email}</div>
                          </div>
                          <button onClick={() => openEditAdmin(a)} title="Edit admin"
                            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--saffron)] transition-colors">
                            <Pencil size={11} />
                          </button>
                          <button onClick={() => setDelAdmin(a)} title="Remove admin"
                            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-colors">
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[var(--text-muted)] mt-3">
                  Created: {new Date(c.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
          )
        })}

        {!centers.length && (
          <div className="col-span-3 py-16 text-center text-[var(--text-muted)]">
            No centers yet. Click "Add Center" to get started.
          </div>
        )}
      </div>

      {/* ── Add Center Modal ── */}
      <Modal open={centerModal === 'add'} onClose={() => setCenterModal(null)} title="Add New Center"
        footer={<>
          <button onClick={() => setCenterModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleAddCenter} disabled={saving}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
            {saving ? 'Adding…' : 'Add Center'}
          </button>
        </>}>
        <ModalField label="Center Name *">
          <input value={cName} onChange={e => setCName(e.target.value)} placeholder="e.g. Vadodara Center" className={inputClass} />
        </ModalField>
        <ModalField label="Location">
          <input value={cLoc} onChange={e => setCLoc(e.target.value)} placeholder="City, State" className={inputClass} />
        </ModalField>
        <ModalField label="Contact Person Name">
          <input value={cAdmin} onChange={e => setCAdmin(e.target.value)} placeholder="Responsible person's name (for display)" className={inputClass} />
        </ModalField>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          After adding the center, use the "Add Admin" button on the center card to create the login account.
        </p>
      </Modal>

      {/* ── Edit Center Modal ── */}
      <Modal open={centerModal === 'edit'} onClose={() => setCenterModal(null)} title="Edit Center"
        footer={<>
          <button onClick={() => setCenterModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleEditCenter} disabled={saving}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>}>
        <ModalField label="Center Name *">
          <input value={cName} onChange={e => setCName(e.target.value)} className={inputClass} />
        </ModalField>
        <ModalField label="Location">
          <input value={cLoc} onChange={e => setCLoc(e.target.value)} className={inputClass} />
        </ModalField>
        <ModalField label="Contact Person Name">
          <input value={cAdmin} onChange={e => setCAdmin(e.target.value)} className={inputClass} />
        </ModalField>
      </Modal>

      {/* ── Add Admin Modal ── */}
      <Modal open={adminModal === 'add'} onClose={() => setAdminModal(null)} title="Add Center Admin"
        footer={<>
          <button onClick={() => setAdminModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleAddAdmin} disabled={saving}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
            {saving ? 'Creating…' : 'Create Admin'}
          </button>
        </>}>
        <ModalField label="Full Name *">
          <input value={aName} onChange={e => setAName(e.target.value)} placeholder="Admin's full name" className={inputClass} />
        </ModalField>
        <ModalField label="Email Address *">
          <input type="email" value={aEmail} onChange={e => setAEmail(e.target.value)} placeholder="admin@smvs.org" className={inputClass} />
        </ModalField>
        <ModalField label="Password *">
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={aPass} onChange={e => setAPass(e.target.value)}
              placeholder="Minimum 8 characters" className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </ModalField>
        <ModalField label="Assign to Center">
          <select value={adminCenterId} onChange={e => setAdminCenterId(e.target.value)} className={inputClass}>
            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </ModalField>
      </Modal>

      {/* ── Edit Admin Modal ── */}
      <Modal open={adminModal === 'edit'} onClose={() => setAdminModal(null)} title="Edit Center Admin"
        footer={<>
          <button onClick={() => setAdminModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleEditAdmin} disabled={saving}
            className="px-5 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>}>
        <ModalField label="Full Name *">
          <input value={aName} onChange={e => setAName(e.target.value)} className={inputClass} />
        </ModalField>
        <ModalField label="Email Address *">
          <input type="email" value={aEmail} onChange={e => setAEmail(e.target.value)} className={inputClass} />
        </ModalField>
        <ModalField label="Assign to Center">
          <select value={adminCenterId} onChange={e => setAdminCenterId(e.target.value)} className={inputClass}>
            {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </ModalField>
        <ModalField label="New Password (leave blank to keep current)">
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={aNewPass} onChange={e => setANewPass(e.target.value)}
              placeholder="Enter new password to reset" className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </ModalField>
      </Modal>

      {/* ── Delete Center Confirmation ── */}
      <Modal open={!!delCenter} onClose={() => setDelCenter(null)} title="Delete Center"
        footer={<>
          <button onClick={() => setDelCenter(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleDeleteCenter} disabled={saving}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60">
            {saving ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </>}>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          Are you sure you want to delete <strong>{delCenter?.name}</strong>?
          This will remove all associated members, sevas, and records permanently.
        </p>
      </Modal>

      {/* ── Delete Admin Confirmation ── */}
      <Modal open={!!delAdmin} onClose={() => setDelAdmin(null)} title="Remove Admin Account"
        footer={<>
          <button onClick={() => setDelAdmin(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleDeleteAdmin} disabled={saving}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60">
            {saving ? 'Removing…' : 'Yes, Remove'}
          </button>
        </>}>
        <p className="text-sm" style={{ color: 'var(--text)' }}>
          Remove admin account for <strong>{delAdmin?.name}</strong> ({delAdmin?.email})?
          They will no longer be able to log in.
        </p>
      </Modal>
    </div>
  )
}
