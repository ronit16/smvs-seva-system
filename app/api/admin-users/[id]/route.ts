import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

  // Update Supabase Auth (email + optional password)
  const authUpdates: { email?: string; password?: string } = { email }
  if (password) authUpdates.password = password

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(params.id, authUpdates)
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 })

  // Update admin_users record
  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .update({ name, email, center_id })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Deleting from Auth cascades to admin_users via FK
  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
