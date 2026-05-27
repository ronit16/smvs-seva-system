import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()

  // Center admin: verify this member belongs to their center
  if (session.role === 'center_admin') {
    const rows = await sql`SELECT center_id FROM members WHERE global_id = ${params.id}`
    const existing = rows[0]
    if (!existing || existing.center_id !== session.centerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  try {
    const [data] = await sql`
      UPDATE members
      SET name = ${body.name}, phone = ${body.phone}, active = ${body.active}
      WHERE global_id = ${params.id}
      RETURNING *
    `
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await sql`DELETE FROM members WHERE global_id = ${params.id}`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
