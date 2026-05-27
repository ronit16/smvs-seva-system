import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId = searchParams.get('centerId')

  try {
    let data
    if (session.role === 'center_admin') {
      data = await sql`
        SELECT
          m.*,
          json_build_object('id', c.id, 'name', c.name) AS center,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM seva_assignments WHERE member_id = m.global_id
          ))) AS assignments,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM seva_completions WHERE member_id = m.global_id
          ))) AS completions
        FROM members m
        JOIN centers c ON c.id = m.center_id
        WHERE m.center_id = ${session.centerId!}
        ORDER BY m.name
      `
    } else if (session.role === 'super_admin' && centerId) {
      data = await sql`
        SELECT
          m.*,
          json_build_object('id', c.id, 'name', c.name) AS center,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM seva_assignments WHERE member_id = m.global_id
          ))) AS assignments,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM seva_completions WHERE member_id = m.global_id
          ))) AS completions
        FROM members m
        JOIN centers c ON c.id = m.center_id
        WHERE m.center_id = ${centerId}
        ORDER BY m.name
      `
    } else {
      data = await sql`
        SELECT
          m.*,
          json_build_object('id', c.id, 'name', c.name) AS center,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM seva_assignments WHERE member_id = m.global_id
          ))) AS assignments,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM seva_completions WHERE member_id = m.global_id
          ))) AS completions
        FROM members m
        JOIN centers c ON c.id = m.center_id
        ORDER BY m.name
      `
    }
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { global_id, name, phone } = body

  if (!global_id || !name || !phone) {
    return NextResponse.json({ error: 'global_id, name and phone are required' }, { status: 400 })
  }

  const centerId = session.role === 'center_admin' ? session.centerId! : body.center_id
  if (!centerId) return NextResponse.json({ error: 'center_id required' }, { status: 400 })

  try {
    const [data] = await sql`
      INSERT INTO members (global_id, name, phone, center_id)
      VALUES (${global_id.toUpperCase()}, ${name}, ${phone}, ${centerId})
      RETURNING *
    `
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
