import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const data = await sql`
      SELECT id, role, center_id, name, email, created_at
      FROM admin_users
      WHERE role = 'center_admin'
      ORDER BY name
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

  const { name, email, password, center_id } = await req.json()
  if (!name || !email || !password || !center_id) {
    return NextResponse.json({ error: 'Name, email, password, and center are required' }, { status: 400 })
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    const [data] = await sql`
      INSERT INTO admin_users (role, center_id, name, email, password_hash)
      VALUES ('center_admin', ${center_id}, ${name}, ${email}, ${passwordHash})
      RETURNING id, role, center_id, name, email, created_at
    `
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    // Unique violation on email
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
