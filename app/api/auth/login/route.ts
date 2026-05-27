import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { role } = body

  // ── SUPER ADMIN / CENTER ADMIN login ───────────────────────
  if (role === 'superadmin' || role === 'admin') {
    const { email, password, centerId } = body

    // Fetch admin user by email
    const rows = await sql`
      SELECT au.*, c.id as center_obj_id, c.name as center_name, c.location as center_location
      FROM admin_users au
      LEFT JOIN centers c ON c.id = au.center_id
      WHERE au.email = ${email}
    `
    const adminUser = rows[0]

    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const valid = await bcrypt.compare(password, adminUser.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Enforce correct tab: super admin must use Super Admin tab
    if (role === 'admin' && adminUser.role !== 'center_admin') {
      return NextResponse.json({ error: 'This account is not a Center Admin. Please use the Super Admin tab.' }, { status: 403 })
    }

    // For center_admin: verify they belong to the selected center
    if (adminUser.role === 'center_admin' && centerId && adminUser.center_id !== centerId) {
      return NextResponse.json({ error: 'Wrong center selected' }, { status: 403 })
    }

    // Build center object for session
    const center = adminUser.center_obj_id
      ? { id: adminUser.center_obj_id, name: adminUser.center_name, location: adminUser.center_location }
      : null

    const token = await createSession({
      userId:         adminUser.id,
      role:           adminUser.role,
      centerId:       adminUser.center_id,
      memberGlobalId: null,
      name:           adminUser.name,
      email:          adminUser.email,
    })

    await setSessionCookie(token)
    return NextResponse.json({ ok: true, role: adminUser.role })
  }

  // ── MEMBER login (Global ID only, no password) ──────────────
  if (role === 'member') {
    const { globalId } = body

    const rows = await sql`
      SELECT m.*, c.id as center_obj_id, c.name as center_name
      FROM members m
      JOIN centers c ON c.id = m.center_id
      WHERE m.global_id = ${globalId.toUpperCase()}
        AND m.active = true
    `
    const member = rows[0]

    if (!member) {
      return NextResponse.json({ error: 'Global ID not found. Contact your center admin.' }, { status: 401 })
    }

    const token = await createSession({
      userId:         member.global_id,
      role:           'member',
      centerId:       member.center_id,
      memberGlobalId: member.global_id,
      name:           member.name,
      email:          null,
    })

    await setSessionCookie(token)
    return NextResponse.json({ ok: true, role: 'member' })
  }

  return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
}
