import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendWhatsApp, msgMonthlyReminder } from '@/lib/whatsapp'

/**
 * Runs on 1st of every month at 08:00 IST (vercel.json: "0 8 1 * *")
 * Sends a WhatsApp reminder to all active members listing their pending sevas.
 */
export async function GET(req: NextRequest) {
  // Security: only Vercel cron can call this
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Fetch all active assignments (without a completion this month)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: assignments } = await supabaseAdmin
    .from('seva_assignments')
    .select(`
      id, member_id, seva_id,
      member:members(global_id, name, phone, center_id),
      seva:sevas(name, center:centers(name)),
      completions:seva_completions(id, completed_date)
    `)

  if (!assignments) return NextResponse.json({ sent: 0 })

  // Group pending sevas by member
  const pendingByMember: Record<string, { member: any; sevaNames: string[]; centerName: string }> = {}

  for (const a of assignments) {
    const member = (a as any).member
    const seva   = (a as any).seva
    const completions: any[] = (a as any).completions || []

    // Check if completed this month
    const completedThisMonth = completions.some(
      c => new Date(c.completed_date) >= startOfMonth
    )
    if (completedThisMonth) continue

    const key = member.global_id
    if (!pendingByMember[key]) {
      pendingByMember[key] = {
        member,
        sevaNames:  [],
        centerName: seva.center?.name || 'SMVS Center',
      }
    }
    pendingByMember[key].sevaNames.push(seva.name)
  }

  let sent = 0
  for (const { member, sevaNames, centerName } of Object.values(pendingByMember)) {
    const ok = await sendWhatsApp(
      member.phone,
      msgMonthlyReminder({ memberName: member.name, sevaNames, centerName })
    )
    if (ok) sent++
  }

  console.log(`[CronMonthly] Sent ${sent} WhatsApp reminders`)
  return NextResponse.json({ ok: true, sent })
}
