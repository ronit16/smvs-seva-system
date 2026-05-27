import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  try {
    const [data] = await sql`
      UPDATE seva_categories
      SET name = ${body.name}, description = ${body.description || null}
      WHERE id = ${params.id}
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
    await sql`DELETE FROM seva_categories WHERE id = ${params.id}`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
