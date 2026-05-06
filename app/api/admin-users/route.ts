import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('role', 'center_admin')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
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

  // Create Supabase Auth user (no email confirmation needed)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 500 })
  }

  // Insert into admin_users table
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .insert({ id: authData.user.id, role: 'center_admin', center_id, name, email })
    .select()
    .single()

  if (error) {
    // Rollback auth user on failure
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
