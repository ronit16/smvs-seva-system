import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, email, password, center_id } = await req.json()
  if (!name || !email || !center_id) {
    return NextResponse.json({ error: 'Name, email, and center are required' }, { status: 400 })
  }

  try {
    let data
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10)
      ;[data] = await sql`
        UPDATE admin_users
        SET name = ${name}, email = ${email}, center_id = ${center_id}, password_hash = ${passwordHash}
        WHERE id = ${params.id}
        RETURNING id, role, center_id, name, email, created_at
      `
    } else {
      ;[data] = await sql`
        UPDATE admin_users
        SET name = ${name}, email = ${email}, center_id = ${center_id}
        WHERE id = ${params.id}
        RETURNING id, role, center_id, name, email, created_at
      `
    }

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await sql`DELETE FROM admin_users WHERE id = ${params.id}`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
