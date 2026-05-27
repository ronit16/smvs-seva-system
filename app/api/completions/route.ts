import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { addDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId = searchParams.get('centerId')
  const memberId = searchParams.get('memberId')

  try {
    let data
    if (session.role === 'center_admin') {
      data = await sql`
        SELECT
          sc.*,
          json_build_object('global_id', m.global_id, 'name', m.name) AS member,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('id', sa.id, 'role', sa.role) AS assignment
        FROM seva_completions sc
        JOIN members m ON m.global_id = sc.member_id
        JOIN sevas sv ON sv.id = sc.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN seva_assignments sa ON sa.id = sc.assignment_id
        WHERE sc.center_id = ${session.centerId!}
          ${memberId ? sql`AND sc.member_id = ${memberId}` : sql``}
        ORDER BY sc.completed_date DESC
      `
    } else if (session.role === 'member') {
      data = await sql`
        SELECT
          sc.*,
          json_build_object('global_id', m.global_id, 'name', m.name) AS member,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('id', sa.id, 'role', sa.role) AS assignment
        FROM seva_completions sc
        JOIN members m ON m.global_id = sc.member_id
        JOIN sevas sv ON sv.id = sc.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN seva_assignments sa ON sa.id = sc.assignment_id
        WHERE sc.member_id = ${session.memberGlobalId!}
          ${memberId ? sql`AND sc.member_id = ${memberId}` : sql``}
        ORDER BY sc.completed_date DESC
      `
    } else if (centerId) {
      data = await sql`
        SELECT
          sc.*,
          json_build_object('global_id', m.global_id, 'name', m.name) AS member,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('id', sa.id, 'role', sa.role) AS assignment
        FROM seva_completions sc
        JOIN members m ON m.global_id = sc.member_id
        JOIN sevas sv ON sv.id = sc.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN seva_assignments sa ON sa.id = sc.assignment_id
        WHERE sc.center_id = ${centerId}
          ${memberId ? sql`AND sc.member_id = ${memberId}` : sql``}
        ORDER BY sc.completed_date DESC
      `
    } else {
      data = await sql`
        SELECT
          sc.*,
          json_build_object('global_id', m.global_id, 'name', m.name) AS member,
          json_build_object(
            'id', sv.id, 'name', sv.name, 'frequency', sv.frequency,
            'category', json_build_object('name', cat.name)
          ) AS seva,
          json_build_object('id', sa.id, 'role', sa.role) AS assignment
        FROM seva_completions sc
        JOIN members m ON m.global_id = sc.member_id
        JOIN sevas sv ON sv.id = sc.seva_id
        JOIN seva_categories cat ON cat.id = sv.category_id
        JOIN seva_assignments sa ON sa.id = sc.assignment_id
        WHERE 1=1
          ${memberId ? sql`AND sc.member_id = ${memberId}` : sql``}
        ORDER BY sc.completed_date DESC
      `
    }
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { assignment_id, completed_date, proof_url, proof_public_id, user_suchan } = body

  try {
    // Fetch assignment to get meta
    const rows = await sql`
      SELECT member_id, seva_id, center_id FROM seva_assignments WHERE id = ${assignment_id}
    `
    const assignment = rows[0]
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

    // Member can only submit their own
    if (session.role === 'member' && assignment.member_id !== session.memberGlobalId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const media_expires_at = proof_url ? addDays(new Date(), 30).toISOString() : null

    const [data] = await sql`
      INSERT INTO seva_completions
        (assignment_id, member_id, seva_id, center_id, completed_date,
         proof_url, proof_public_id, user_suchan, media_expires_at)
      VALUES (
        ${assignment_id},
        ${assignment.member_id},
        ${assignment.seva_id},
        ${assignment.center_id},
        ${completed_date},
        ${proof_url || null},
        ${proof_public_id || null},
        ${user_suchan || null},
        ${media_expires_at}
      )
      RETURNING *
    `
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
