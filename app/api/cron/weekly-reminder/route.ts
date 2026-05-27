import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
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
  const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysLeft = lastDay.getDate() - now.getDate()
  if (daysLeft > 7) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'Not last week of month' })
  }

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  try {
    const assignments = await sql`
      SELECT
        sa.id, sa.member_id, sa.seva_id,
        json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone) AS member,
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

    const pendingByMember: Record<string, { member: any; sevaNames: string[]; centerName: string }> = {}

    for (const a of assignments) {
      const member: any     = a.member
      const seva: any       = a.seva
      const completions: any[] = a.completions || []

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
  } catch (err: any) {
    console.error('[CronWeekly] Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
