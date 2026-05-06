import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId = searchParams.get('centerId')

  let query = supabaseAdmin
    .from('members')
    .select('*, center:centers(id,name)')
    .order('name')

  // Center Admin: restricted to their center
  if (session.role === 'center_admin') {
    query = query.eq('center_id', session.centerId!)
  } else if (session.role === 'super_admin' && centerId) {
    // Super Admin can filter by center
    query = query.eq('center_id', centerId)
  }
  // Super Admin with no filter: returns all

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { global_id, name, phone } = body

  if (!global_id || !name || !phone) {
    return NextResponse.json({ error: 'global_id, name and phone are required' }, { status: 400 })
  }

  // Center admin can only add to their center
  const centerId = session.role === 'center_admin'
    ? session.centerId!
    : body.center_id

  if (!centerId) return NextResponse.json({ error: 'center_id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('members')
    .insert({ global_id: global_id.toUpperCase(), name, phone, center_id: centerId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
