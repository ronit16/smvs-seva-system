'use client'
import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Badge, { freqVariant } from '@/components/ui/Badge'
import Modal, { ModalField, inputClass, selectClass, textareaClass } from '@/components/ui/Modal'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'one-time', 'custom']

export default function SevasPage() {
  const [sevas, setSevas]   = useState<any[]>([])
  const [cats, setCats]     = useState<any[]>([])
  const [modal, setModal]   = useState<'add' | 'edit' | 'delete' | null>(null)
  const [editing, setEditing] = useState<any | null>(null)
  const [deleting, setDeleting] = useState<any | null>(null)
  const [fCat, setFCat]     = useState('')
  const [fName, setFName]   = useState('')
  const [fDesc, setFDesc]   = useState('')
  const [fFreq, setFFreq]   = useState('weekly')

  // filter state
  const [filterSearch, setFilterSearch] = useState('')
  const [filterCat, setFilterCat]       = useState('')
  const [filterFreq, setFilterFreq]     = useState('')

  const hasFilters = filterSearch || filterCat || filterFreq

  const filteredSevas = sevas.filter(s => {
    if (filterCat && s.category_id !== filterCat) return false
    if (filterFreq && s.frequency !== filterFreq) return false
    if (filterSearch && !s.name.toLowerCase().includes(filterSearch.toLowerCase())) return false
    return true
  })

  function clearFilters() {
    setFilterSearch(''); setFilterCat(''); setFilterFreq('')
  }

  const load = useCallback(async () => {
    const [sr, cr] = await Promise.all([fetch('/api/sevas'), fetch('/api/categories')])
    const [sd, cd] = await Promise.all([sr.json(), cr.json()])
    setSevas(sd.data || [])
    setCats(cd.data || [])
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() {
    setFCat(cats[0]?.id || ''); setFName(''); setFDesc(''); setFFreq('weekly'); setModal('add')
  }
  function openEdit(s: any) {
    setEditing(s); setFCat(s.category_id); setFName(s.name); setFDesc(s.description || ''); setFFreq(s.frequency); setModal('edit')
  }

  async function handleAdd() {
    if (!fName || !fCat) return toast.error('Name and category required')
    const res = await fetch('/api/sevas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: fCat, name: fName, description: fDesc, frequency: fFreq }),
    })
    const d = await res.json()
    if (!res.ok) return toast.error(d.error)
    toast.success('Seva added!'); setModal(null); load()
  }

  async function handleEdit() {
    const res = await fetch(`/api/sevas/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: fCat, name: fName, description: fDesc, frequency: fFreq }),
    })
    if (!res.ok) return toast.error('Failed')
    toast.success('Updated!'); setModal(null); load()
  }

  function openDelete(s: any) { setDeleting(s); setModal('delete') }

  async function handleDelete() {
    if (!deleting) return
    await fetch(`/api/sevas/${deleting.id}`, { method: 'DELETE' })
    toast.success('Seva removed'); setModal(null); load()
  }

  const FormFields = () => (<>
    <ModalField label="Category *">
      <select value={fCat} onChange={e => setFCat(e.target.value)} className={selectClass}>
        {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </ModalField>
    <ModalField label="Seva Name *">
      <input value={fName} onChange={e => setFName(e.target.value)} placeholder="e.g. Rotlo Making" className={inputClass} />
    </ModalField>
    <ModalField label="Description (shown to member)">
      <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} className={textareaClass} placeholder="Instructions for the member…" />
    </ModalField>
    <ModalField label="Frequency *">
      <select value={fFreq} onChange={e => setFFreq(e.target.value)} className={selectClass}>
        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
    </ModalField>
  </>)

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cinzel text-xl font-bold" style={{ color: 'var(--maroon)' }}>Sevas</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{sevas.length} active sevas in your center</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
          <Plus size={16} /> Add Seva
        </button>
      </div>

      {!cats.length && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 mb-5">
          ⚠ Please add Seva Categories first before creating sevas.
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5 p-4 bg-white rounded-2xl border border-[rgba(212,166,98,0.3)]">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={filterSearch}
            onChange={e => setFilterSearch(e.target.value)}
            placeholder="Search seva name…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] focus:outline-none focus:border-[var(--saffron)]"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="py-2 px-3 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] focus:outline-none focus:border-[var(--saffron)] text-[var(--text-main)]"
        >
          <option value="">All Categories</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterFreq}
          onChange={e => setFilterFreq(e.target.value)}
          className="py-2 px-3 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] focus:outline-none focus:border-[var(--saffron)] text-[var(--text-main)]"
        >
          <option value="">All Frequencies</option>
          {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-red-500 hover:border-red-300 transition-colors">
            <X size={13} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-[var(--text-muted)]">
          {hasFilters ? `${filteredSevas.length} of ${sevas.length}` : sevas.length} seva{sevas.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredSevas.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] p-5 hover:shadow-md transition-all seva-card">
            <div className="text-[10px] font-bold uppercase tracking-[1px] mb-1" style={{ color: 'var(--gold)' }}>
              {s.category?.name}
            </div>
            <div className="flex justify-between items-start mb-2">
              <div className="font-cinzel text-sm font-bold" style={{ color: 'var(--maroon)' }}>{s.name}</div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--saffron)] hover:text-[var(--saffron)]"><Pencil size={13} /></button>
                <button onClick={() => openDelete(s)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{s.description || 'No description'}</p>
            <div className="flex items-center gap-2">
              <Badge variant={freqVariant(s.frequency)}>{s.frequency}</Badge>
              <span className="text-xs text-[var(--text-muted)]">{s.assignments?.length || 0} assigned</span>
            </div>
          </div>
        ))}
        {!filteredSevas.length && (
          <div className="col-span-3 py-16 text-center text-[var(--text-muted)]">
            {hasFilters ? 'No sevas match your filters.' : 'No sevas yet. Add your first seva!'}
          </div>
        )}
      </div>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add New Seva"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>Add Seva</button>
        </>}>
        <FormFields />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Edit Seva"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleEdit} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>Save</button>
        </>}>
        <FormFields />
      </Modal>

      <Modal open={modal === 'delete'} onClose={() => setModal(null)} title="Delete Seva"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleDelete} className="px-5 py-2 rounded-xl text-white text-sm font-semibold bg-red-600 hover:bg-red-700">Delete</button>
        </>}>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--text)]">
            Are you sure you want to delete <span className="font-semibold">{deleting?.name}</span>?
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            This will remove all member assignments for this seva. This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  )
}
