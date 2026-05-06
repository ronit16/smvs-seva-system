import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, msgPendingReminder } from '@/lib/whatsapp'

/**
 * Runs every Monday at 08:00 (vercel.json: "0 8 * * 1")
 * Sends reminder only in the last week of the month.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Only send if ≤ 7 days remain in the month
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysLeft = lastDay.getDate() - now.getDate()
  if (daysLeft > 7) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Not last week of month' })
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: assignments } = await supabaseAdmin
    .from('seva_assignments')
    .select(`
      id, member_id, seva_id,
      member:members(global_id, name, phone),
      seva:sevas(name, center:centers(name)),
      completions:seva_completions(id, completed_date)
    `)

  if (!assignments) return NextResponse.json({ sent: 0 })

  const pendingByMember: Record<string, { member: any; sevaNames: string[]; centerName: string }> = {}

  for (const a of assignments) {
    const member      = (a as any).member
    const seva        = (a as any).seva
    const completions = (a as any).completions || []

    const completedThisMonth = completions.some(
      (c: any) => new Date(c.completed_date) >= startOfMonth
    )
    if (completedThisMonth) continue

    const key = member.global_id
    if (!pendingByMember[key]) {
      pendingByMember[key] = { member, sevaNames: [], centerName: seva.center?.name || 'SMVS Center' }
    }
    pendingByMember[key].sevaNames.push(seva.name)
  }

  let sent = 0
  for (const { member, sevaNames, centerName } of Object.values(pendingByMember)) {
    const ok = await sendWhatsApp(
      member.phone,
      msgPendingReminder({ memberName: member.name, sevaNames, centerName, daysLeft })
    )
    if (ok) sent++
  }

  console.log(`[CronWeekly] Sent ${sent} pending reminders (${daysLeft} days left in month)`)
  return NextResponse.json({ ok: true, sent })
}
