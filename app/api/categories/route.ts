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
          sc.*,
          json_build_object('id', c.id, 'name', c.name) AS center,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM sevas WHERE category_id = sc.id
          ))) AS sevas
        FROM seva_categories sc
        JOIN centers c ON c.id = sc.center_id
        WHERE sc.center_id = ${session.centerId!}
        ORDER BY sc.name
      `
    } else if (centerId) {
      data = await sql`
        SELECT
          sc.*,
          json_build_object('id', c.id, 'name', c.name) AS center,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM sevas WHERE category_id = sc.id
          ))) AS sevas
        FROM seva_categories sc
        JOIN centers c ON c.id = sc.center_id
        WHERE sc.center_id = ${centerId}
        ORDER BY sc.name
      `
    } else {
      data = await sql`
        SELECT
          sc.*,
          json_build_object('id', c.id, 'name', c.name) AS center,
          json_build_array(json_build_object('count', (
            SELECT COUNT(*)::int FROM sevas WHERE category_id = sc.id
          ))) AS sevas
        FROM seva_categories sc
        JOIN centers c ON c.id = sc.center_id
        ORDER BY sc.name
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
      INSERT INTO seva_categories (name, description, center_id)
      VALUES (${body.name}, ${body.description || null}, ${centerId})
      RETURNING *
    `
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
