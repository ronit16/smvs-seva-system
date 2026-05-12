'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Modal, { ModalField, inputClass } from '@/components/ui/Modal'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Member {
  global_id: string; name: string; phone: string; active: boolean
  assignments?: [{ count: number }]
  completions?: [{ count: number }]
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editing, setEditing] = useState<Member | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)

  const [fId, setFId]     = useState('')
  const [fName, setFName] = useState('')
  const [fPhone, setFPhone] = useState('')

  const load = useCallback(async () => {
    const res  = await fetch('/api/members')
    const data = await res.json()
    setMembers(data.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setFId(''); setFName(''); setFPhone(''); setModal('add')
  }
  function openEdit(m: Member) {
    setEditing(m); setFName(m.name); setFPhone(m.phone); setModal('edit')
  }

  async function handleAdd() {
    if (!fId || !fName || !fPhone) return toast.error('All fields required')
    const res  = await fetch('/api/members', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ global_id: fId, name: fName, phone: fPhone }) })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error)
    toast.success('Member added! 🙏')
    setModal(null); load()
  }

  async function handleEdit() {
    if (!editing) return
    const res  = await fetch(`/api/members/${editing.global_id}`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: fName, phone: fPhone }) })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error)
    toast.success('Member updated!'); setModal(null); load()
  }

  function openDelete(m: Member) {
    setDeleting(m); setModal('delete')
  }

  async function handleDelete() {
    if (!deleting) return
    await fetch(`/api/members/${deleting.global_id}`, { method: 'DELETE' })
    toast.success('Member removed'); setModal(null); load()
  }

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.global_id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cinzel text-xl font-bold" style={{color:'var(--maroon)'}}>Members</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{members.length} registered members in your center</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{background:'linear-gradient(135deg,var(--maroon),var(--saffron-dark))'}}>
          <Plus size={16}/> Add Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID…"
              className="pl-9 pr-3 py-2 border border-[var(--border)] rounded-xl text-sm w-full outline-none focus:border-[var(--saffron)] bg-[#FAFAFA]"/>
          </div>
          <span className="text-xs text-[var(--text-muted)]">{filtered.length} results</span>
        </div>

        <table className="w-full">
          <thead className="bg-[var(--cream2)]">
            <tr>
              {['Global ID','Name','Phone','Assigned','Completed','Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.8px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">Loading…</td></tr>
            ) : filtered.map(m => (
              <tr key={m.global_id} className="border-b border-[rgba(232,213,196,0.4)] hover:bg-[rgba(255,243,224,0.5)]">
                <td className="px-5 py-3">
                  <code className="text-xs bg-[var(--cream2)] px-2 py-1 rounded-md font-mono">{m.global_id}</code>
                </td>
                <td className="px-5 py-3 font-semibold text-sm">{m.name}</td>
                <td className="px-5 py-3 text-sm text-[var(--text-muted)]">{m.phone}</td>
                <td className="px-5 py-3 text-sm text-center">{m.assignments?.[0]?.count ?? 0}</td>
                <td className="px-5 py-3 text-sm text-center">{m.completions?.[0]?.count ?? 0}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(m)}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--saffron)] hover:text-[var(--saffron)]">
                      <Pencil size={13}/>
                    </button>
                    <button onClick={() => openDelete(m)}
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-500">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !filtered.length && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add New Member"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{background:'linear-gradient(135deg,var(--maroon),var(--saffron-dark))'}}>Add Member</button>
        </>}
      >
        <div className="bg-blue-50 text-blue-800 border border-blue-200 rounded-xl p-3 mb-4 text-xs">
          Only pre-registered members can log into the system. Self-registration is not allowed.
        </div>
        <ModalField label="Global ID *" hint="Unique across all centers — e.g. AHM006">
          <input value={fId} onChange={e => setFId(e.target.value.toUpperCase())} placeholder="AHM006" className={inputClass}/>
        </ModalField>
        <ModalField label="Full Name *">
          <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Member's full name" className={inputClass}/>
        </ModalField>
        <ModalField label="WhatsApp Phone *" hint="Used for automatic seva notifications">
          <input value={fPhone} onChange={e => setFPhone(e.target.value)} placeholder="10-digit mobile" className={inputClass}/>
        </ModalField>
      </Modal>

      {/* Edit Modal */}
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Edit Member"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleEdit} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{background:'linear-gradient(135deg,var(--maroon),var(--saffron-dark))'}}>Save</button>
        </>}
      >
        <ModalField label="Global ID">
          <input value={editing?.global_id || ''} disabled className={`${inputClass} opacity-60`}/>
        </ModalField>
        <ModalField label="Full Name">
          <input value={fName} onChange={e => setFName(e.target.value)} className={inputClass}/>
        </ModalField>
        <ModalField label="WhatsApp Phone">
          <input value={fPhone} onChange={e => setFPhone(e.target.value)} className={inputClass}/>
        </ModalField>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Remove Member"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2 rounded-xl text-white text-sm font-semibold bg-red-600 hover:bg-red-700">Remove</button>
        </>}
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--text)]">
            Are you sure you want to remove <span className="font-semibold">{deleting?.name}</span>?
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            This will permanently delete their profile and all seva assignments. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
