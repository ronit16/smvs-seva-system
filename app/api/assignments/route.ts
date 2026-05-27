import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  sendWhatsApp,
  msgAssignmentLeader,
  msgAssignmentMember,
} from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sevaId   = searchParams.get('sevaId')
  const memberId = searchParams.get('memberId')

  try {
    let data
    if (session.role === 'center_admin') {
      data = await sql`
        SELECT
          sa.*,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'description', sv.description, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone) AS member,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', sc.id,
              'completed_date', sc.completed_date,
              'proof_url', sc.proof_url,
              'user_suchan', sc.user_suchan,
              'admin_remark', sc.admin_remark,
              'remark_media_url', sc.remark_media_url
            ) ORDER BY sc.completed_date DESC)
            FROM seva_completions sc WHERE sc.assignment_id = sa.id),
            '[]'::json
          ) AS completions
        FROM seva_assignments sa
        JOIN sevas sv ON sv.id = sa.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN members m ON m.global_id = sa.member_id
        WHERE sa.center_id = ${session.centerId!}
          ${sevaId   ? sql`AND sa.seva_id   = ${sevaId}`   : sql``}
          ${memberId ? sql`AND sa.member_id = ${memberId}` : sql``}
        ORDER BY sa.created_at DESC
      `
    } else if (session.role === 'member') {
      data = await sql`
        SELECT
          sa.*,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'description', sv.description, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone) AS member,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', sc.id,
              'completed_date', sc.completed_date,
              'proof_url', sc.proof_url,
              'user_suchan', sc.user_suchan,
              'admin_remark', sc.admin_remark,
              'remark_media_url', sc.remark_media_url
            ) ORDER BY sc.completed_date DESC)
            FROM seva_completions sc WHERE sc.assignment_id = sa.id),
            '[]'::json
          ) AS completions
        FROM seva_assignments sa
        JOIN sevas sv ON sv.id = sa.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN members m ON m.global_id = sa.member_id
        WHERE sa.member_id = ${session.memberGlobalId!}
          ${sevaId   ? sql`AND sa.seva_id   = ${sevaId}`   : sql``}
          ${memberId ? sql`AND sa.member_id = ${memberId}` : sql``}
        ORDER BY sa.created_at DESC
      `
    } else {
      data = await sql`
        SELECT
          sa.*,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'description', sv.description, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone) AS member,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', sc.id,
              'completed_date', sc.completed_date,
              'proof_url', sc.proof_url,
              'user_suchan', sc.user_suchan,
              'admin_remark', sc.admin_remark,
              'remark_media_url', sc.remark_media_url
            ) ORDER BY sc.completed_date DESC)
            FROM seva_completions sc WHERE sc.assignment_id = sa.id),
            '[]'::json
          ) AS completions
        FROM seva_assignments sa
        JOIN sevas sv ON sv.id = sa.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN members m ON m.global_id = sa.member_id
        WHERE 1=1
          ${sevaId   ? sql`AND sa.seva_id   = ${sevaId}`   : sql``}
          ${memberId ? sql`AND sa.member_id = ${memberId}` : sql``}
        ORDER BY sa.created_at DESC
      `
    }
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const centerId = session.role === 'center_admin' ? session.centerId! : body.centerId
  const { sevaId, leaderId, memberIds } = body

  if (!sevaId || !leaderId) {
    return NextResponse.json({ error: 'sevaId and leaderId required' }, { status: 400 })
  }

  try {
    // Remove existing assignments for this seva+center
    await sql`DELETE FROM seva_assignments WHERE seva_id = ${sevaId} AND center_id = ${centerId}`

    // Build rows: leader + unique members
    const rows = [
      { seva_id: sevaId, member_id: leaderId, center_id: centerId, role: 'leader' as const },
      ...(memberIds || [])
        .filter((id: string) => id !== leaderId)
        .map((id: string) => ({ seva_id: sevaId, member_id: id, center_id: centerId, role: 'member' as const })),
    ]

    // Insert all rows
    await Promise.all(
      rows.map(r =>
        sql`INSERT INTO seva_assignments (seva_id, member_id, center_id, role)
            VALUES (${r.seva_id}, ${r.member_id}, ${r.center_id}, ${r.role})`
      )
    )

    // Fetch inserted rows with nested data for WhatsApp
    const inserted = await sql`
      SELECT
        sa.*,
        json_build_object(
          'name', sv.name, 'frequency', sv.frequency,
          'center', json_build_object('name', c.name)
        ) AS seva,
        json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone) AS member
      FROM seva_assignments sa
      JOIN sevas sv ON sv.id = sa.seva_id
      JOIN centers c ON c.id = sv.center_id
      JOIN members m ON m.global_id = sa.member_id
      WHERE sa.seva_id = ${sevaId} AND sa.center_id = ${centerId}
      ORDER BY sa.created_at
    `

    // ── WhatsApp Notifications (fire-and-forget) ──────────────────
    try {
      const leader  = inserted.find((a: any) => a.role === 'leader')
      const members = inserted.filter((a: any) => a.role === 'member')
      const seva    = leader?.seva

      if (leader?.member && seva) {
        const centerName = seva.center?.name || 'SMVS Center'
        await sendWhatsApp(
          leader.member.phone,
          msgAssignmentLeader({
            leaderName:  leader.member.name,
            sevaName:    seva.name,
            frequency:   seva.frequency,
            centerName,
            memberNames: members.map((m: any) => m.member?.name).filter(Boolean),
          })
        )
        for (const m of members) {
          if (m.member?.phone) {
            await sendWhatsApp(
              m.member.phone,
              msgAssignmentMember({
                memberName:  m.member.name,
                sevaName:    seva.name,
                frequency:   seva.frequency,
                centerName,
                leaderName:  leader.member.name,
                leaderPhone: leader.member.phone,
              })
            )
          }
        }
      }
    } catch (wpErr) {
      console.error('[WhatsApp assignment notification]', wpErr)
    }

    return NextResponse.json({ data: inserted }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
