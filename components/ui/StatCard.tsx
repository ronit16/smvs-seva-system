import React from 'react'

type Color = 'orange' | 'maroon' | 'green' | 'blue'

interface Props {
  value: string | number
  label: string
  sub?: string
  icon: React.ReactNode
  color: Color
}

const colorMap: Record<Color, { icon: string; border: string; className: string }> = {
  orange: { icon: 'bg-[#FEF3E8]', border: '', className: 'stat-card-orange' },
  maroon: { icon: 'bg-[#FCE8E8]', border: '', className: 'stat-card-maroon' },
  green:  { icon: 'bg-[#E8F5E9]', border: '', className: 'stat-card-green' },
  blue:   { icon: 'bg-[#E3F2FD]', border: '', className: 'stat-card-blue' },
}

export default function StatCard({ value, label, sub, icon, color }: Props) {
  const { icon: iconBg, className } = colorMap[color]
  return (
    <div className={`bg-white border border-[rgba(212,166,98,0.3)] rounded-2xl p-5 relative overflow-hidden ${className}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-[var(--text)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] mt-1 font-medium">{label}</div>
      {sub && <div className="text-[11px] text-[#2E7D32] mt-1.5 font-medium">{sub}</div>}
    </div>
  )
}
