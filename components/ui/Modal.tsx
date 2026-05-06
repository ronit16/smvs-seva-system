'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, footer, size = 'md' }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/55 z-[1000] flex items-center justify-center p-5"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-white rounded-[20px] w-full shadow-2xl border border-[rgba(201,136,13,0.2)] max-h-[90vh] flex flex-col animate-fadeup
        ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6">
          <h2 className="font-cinzel text-base font-semibold text-maroon-500" style={{color:'var(--maroon)'}}>
            {title}
          </h2>
          <button onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-lg hover:bg-[var(--cream2)]">
            <X size={18}/>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-5 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-7 pb-6 flex gap-2.5 justify-end border-t border-[var(--border)] pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function ModalField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.7px] mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[var(--text-light)] mt-1" style={{color:'var(--text-muted)'}}>{hint}</p>}
    </div>
  )
}

export const inputClass = `w-full px-3.5 py-2.5 border-[1.5px] border-[var(--border)] rounded-[9px]
  font-[Poppins] text-[13px] text-[var(--text)] bg-[#FAFAFA] outline-none transition-colors
  focus:border-[var(--saffron)] focus:bg-white`

export const selectClass = inputClass

export const textareaClass = `${inputClass} resize-y min-h-[90px]`
