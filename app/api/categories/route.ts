import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

function centerFilter(session: Awaited<ReturnType<typeof getSession>>, query: any) {
  if (session?.role === 'center_admin') return query.eq('center_id', session.centerId!)
  return query
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId = searchParams.get('centerId')

  let query = supabaseAdmin
    .from('seva_categories')
    .select('*, center:centers(id,name), sevas(count)')
    .order('name')

  if (session.role === 'center_admin') {
    query = query.eq('center_id', session.centerId!)
  } else if (centerId) {
    query = query.eq('center_id', centerId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const centerId = session.role === 'center_admin' ? session.centerId! : body.center_id

  const { data, error } = await supabaseAdmin
    .from('seva_categories')
    .insert({ name: body.name, description: body.description, center_id: centerId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
