'use client'
import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Modal, { ModalField, inputClass, textareaClass } from '@/components/ui/Modal'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const [cats, setCats] = useState<any[]>([])
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<any | null>(null)
  const [fName, setFName] = useState('')
  const [fDesc, setFDesc] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/categories')
    const d = await res.json()
    setCats(d.data || [])
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setFName(''); setFDesc(''); setModal('add') }
  function openEdit(c: any) { setEditing(c); setFName(c.name); setFDesc(c.description || ''); setModal('edit') }

  async function handleAdd() {
    if (!fName) return toast.error('Name required')
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fName, description: fDesc }),
    })
    const d = await res.json()
    if (!res.ok) return toast.error(d.error)
    toast.success('Category added!'); setModal(null); load()
  }

  async function handleEdit() {
    const res = await fetch(`/api/categories/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fName, description: fDesc }),
    })
    if (!res.ok) return toast.error('Failed')
    toast.success('Updated!'); setModal(null); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? All sevas inside will also be deleted.')) return
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    toast.success('Deleted'); load()
  }

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-cinzel text-xl font-bold" style={{ color: 'var(--maroon)' }}>Seva Categories</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Group sevas into meaningful categories</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {cats.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-[rgba(212,166,98,0.3)] p-5 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <div className="font-cinzel text-sm font-bold" style={{ color: 'var(--maroon)' }}>{c.name}</div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--saffron)] hover:text-[var(--saffron)]"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-red-400 hover:text-red-500"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{c.description || 'No description'}</p>
            <div className="mt-3 text-xs font-medium" style={{ color: 'var(--gold)' }}>
              {Array.isArray(c.sevas) ? c.sevas[0]?.count || 0 : 0} seva(s)
            </div>
          </div>
        ))}
        {!cats.length && (
          <div className="col-span-3 py-16 text-center text-[var(--text-muted)]">
            No categories yet. Add your first one!
          </div>
        )}
      </div>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Add Category"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>Add</button>
        </>}>
        <ModalField label="Category Name *">
          <input value={fName} onChange={e => setFName(e.target.value)} placeholder="e.g. Kitchen Seva" className={inputClass} />
        </ModalField>
        <ModalField label="Description">
          <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} className={textareaClass} placeholder="Brief description…" />
        </ModalField>
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title="Edit Category"
        footer={<>
          <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold">Cancel</button>
          <button onClick={handleEdit} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg,var(--maroon),var(--saffron-dark))' }}>Save</button>
        </>}>
        <ModalField label="Name">
          <input value={fName} onChange={e => setFName(e.target.value)} className={inputClass} />
        </ModalField>
        <ModalField label="Description">
          <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} className={textareaClass} />
        </ModalField>
      </Modal>
    </div>
  )
}
