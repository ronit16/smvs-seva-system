type Variant = 'success' | 'pending' | 'assigned' | 'leader' | 'member' | 'daily' | 'weekly' | 'monthly' | 'onetime' | 'center' | 'error'

const styles: Record<Variant, string> = {
  success:  'bg-green-50  text-green-800  border-green-200',
  pending:  'bg-orange-50 text-orange-800 border-orange-200',
  assigned: 'bg-blue-50   text-blue-800   border-blue-200',
  leader:   'bg-pink-50   text-pink-800   border-pink-200',
  member:   'bg-purple-50 text-purple-800 border-purple-200',
  daily:    'bg-green-50  text-green-800  border-green-200',
  weekly:   'bg-blue-50   text-blue-800   border-blue-200',
  monthly:  'bg-orange-50 text-orange-800 border-orange-200',
  onetime:  'bg-purple-50 text-purple-800 border-purple-200',
  center:   'bg-[#FDF3DC] text-[#6B4200] border-[rgba(201,136,13,0.3)]',
  error:    'bg-red-50    text-red-800    border-red-200',
}

export function freqVariant(freq: string): Variant {
  const map: Record<string, Variant> = {
    daily: 'daily', weekly: 'weekly', monthly: 'monthly', 'one-time': 'onetime', custom: 'onetime',
  }
  return map[freq] || 'daily'
}

export default function Badge({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles[variant]}`}>
      {children}
    </span>
  )
}
