import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { sendWhatsApp, msgMonthlyReminder } from '@/lib/whatsapp'

/**
 * Runs on 1st of every month at 08:00 IST (vercel.json: "0 8 1 * *")
 * Sends a WhatsApp reminder to all active members listing their pending sevas.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

  try {
    const assignments = await sql`
      SELECT
        sa.id, sa.member_id, sa.seva_id,
        json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone, 'center_id', m.center_id) AS member,
        json_build_object('name', sv.name, 'center', json_build_object('name', c.name)) AS seva,
        COALESCE(
          (SELECT json_agg(json_build_object('id', sc.id, 'completed_date', sc.completed_date::text))
           FROM seva_completions sc WHERE sc.assignment_id = sa.id),
          '[]'::json
        ) AS completions
      FROM seva_assignments sa
      JOIN members m ON m.global_id = sa.member_id AND m.active = true
      JOIN sevas sv ON sv.id = sa.seva_id AND sv.active = true
      JOIN centers c ON c.id = sv.center_id
    `

    // Group pending sevas by member
    const pendingByMember: Record<string, { member: any; sevaNames: string[]; centerName: string }> = {}

    for (const a of assignments) {
      const member: any = a.member
      const seva: any   = a.seva
      const completions: any[] = a.completions || []

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
  } catch (err: any) {
    console.error('[CronMonthly] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
