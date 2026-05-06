import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { role } = body

  // ── SUPER ADMIN / CENTER ADMIN login ───────────────────────
  if (role === 'superadmin' || role === 'admin') {
    const { email, password, centerId } = body

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email, password,
    })
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Fetch admin_users record
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*, center:centers(*)')
      .eq('id', authData.user.id)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json({ error: 'Not authorised as admin' }, { status: 403 })
    }

    // For center_admin: verify they belong to the selected center
    if (adminUser.role === 'center_admin' && centerId && adminUser.center_id !== centerId) {
      return NextResponse.json({ error: 'Wrong center selected' }, { status: 403 })
    }

    const token = await createSession({
      userId:         authData.user.id,
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

    const { data: member, error } = await supabaseAdmin
      .from('members')
      .select('*, center:centers(*)')
      .eq('global_id', globalId.toUpperCase())
      .eq('active', true)
      .single()

    if (error || !member) {
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
