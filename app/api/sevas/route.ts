import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId   = searchParams.get('centerId')
  const categoryId = searchParams.get('categoryId')

  try {
    let data
    if (session.role === 'center_admin') {
      data = await sql`
        SELECT
          s.*,
          json_build_object('id', cat.id, 'name', cat.name) AS category,
          json_build_object('id', ctr.id, 'name', ctr.name) AS center,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', sa.id,
              'role', sa.role,
              'member_id', sa.member_id,
              'member', json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone),
              'completions', COALESCE(
                (SELECT json_agg(json_build_object(
                  'id', sc.id,
                  'completed_date', sc.completed_date,
                  'proof_url', sc.proof_url,
                  'user_suchan', sc.user_suchan,
                  'admin_remark', sc.admin_remark
                ) ORDER BY sc.completed_date DESC)
                FROM seva_completions sc WHERE sc.assignment_id = sa.id),
                '[]'::json
              )
            ))
            FROM seva_assignments sa
            JOIN members m ON m.global_id = sa.member_id
            WHERE sa.seva_id = s.id),
            '[]'::json
          ) AS assignments
        FROM sevas s
        JOIN seva_categories cat ON cat.id = s.category_id
        JOIN centers ctr ON ctr.id = s.center_id
        WHERE s.active = true
          AND s.center_id = ${session.centerId!}
          ${categoryId ? sql`AND s.category_id = ${categoryId}` : sql``}
        ORDER BY s.name
      `
    } else if (centerId) {
      data = await sql`
        SELECT
          s.*,
          json_build_object('id', cat.id, 'name', cat.name) AS category,
          json_build_object('id', ctr.id, 'name', ctr.name) AS center,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', sa.id,
              'role', sa.role,
              'member_id', sa.member_id,
              'member', json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone),
              'completions', COALESCE(
                (SELECT json_agg(json_build_object(
                  'id', sc.id,
                  'completed_date', sc.completed_date,
                  'proof_url', sc.proof_url,
                  'user_suchan', sc.user_suchan,
                  'admin_remark', sc.admin_remark
                ) ORDER BY sc.completed_date DESC)
                FROM seva_completions sc WHERE sc.assignment_id = sa.id),
                '[]'::json
              )
            ))
            FROM seva_assignments sa
            JOIN members m ON m.global_id = sa.member_id
            WHERE sa.seva_id = s.id),
            '[]'::json
          ) AS assignments
        FROM sevas s
        JOIN seva_categories cat ON cat.id = s.category_id
        JOIN centers ctr ON ctr.id = s.center_id
        WHERE s.active = true
          AND s.center_id = ${centerId}
          ${categoryId ? sql`AND s.category_id = ${categoryId}` : sql``}
        ORDER BY s.name
      `
    } else {
      data = await sql`
        SELECT
          s.*,
          json_build_object('id', cat.id, 'name', cat.name) AS category,
          json_build_object('id', ctr.id, 'name', ctr.name) AS center,
          COALESCE(
            (SELECT json_agg(json_build_object(
              'id', sa.id,
              'role', sa.role,
              'member_id', sa.member_id,
              'member', json_build_object('global_id', m.global_id, 'name', m.name, 'phone', m.phone),
              'completions', COALESCE(
                (SELECT json_agg(json_build_object(
                  'id', sc.id,
                  'completed_date', sc.completed_date,
                  'proof_url', sc.proof_url,
                  'user_suchan', sc.user_suchan,
                  'admin_remark', sc.admin_remark
                ) ORDER BY sc.completed_date DESC)
                FROM seva_completions sc WHERE sc.assignment_id = sa.id),
                '[]'::json
              )
            ))
            FROM seva_assignments sa
            JOIN members m ON m.global_id = sa.member_id
            WHERE sa.seva_id = s.id),
            '[]'::json
          ) AS assignments
        FROM sevas s
        JOIN seva_categories cat ON cat.id = s.category_id
        JOIN centers ctr ON ctr.id = s.center_id
        WHERE s.active = true
          ${categoryId ? sql`AND s.category_id = ${categoryId}` : sql``}
        ORDER BY s.name
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
  const centerId = session.role === 'center_admin' ? session.centerId! : body.center_id

  try {
    const [data] = await sql`
      INSERT INTO sevas (category_id, center_id, name, description, frequency)
      VALUES (${body.category_id}, ${centerId}, ${body.name}, ${body.description || null}, ${body.frequency})
      RETURNING *
    `
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
