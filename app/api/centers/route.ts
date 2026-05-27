import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = await sql`
      SELECT
        c.id, c.name, c.location, c.admin_name, c.created_at,
        json_build_array(json_build_object('count', (
          SELECT COUNT(*)::int FROM members WHERE center_id = c.id
        ))) AS members,
        json_build_array(json_build_object('count', (
          SELECT COUNT(*)::int FROM sevas WHERE center_id = c.id
        ))) AS sevas,
        json_build_array(json_build_object('count', (
          SELECT COUNT(*)::int FROM seva_completions WHERE center_id = c.id
        ))) AS seva_completions
      FROM centers c
      ORDER BY c.name
    `
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, location, admin_name } = body

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  try {
    const [data] = await sql`
      INSERT INTO centers (name, location, admin_name)
      VALUES (${name}, ${location || null}, ${admin_name || null})
      RETURNING *
    `
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
