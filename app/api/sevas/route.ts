import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId   = searchParams.get('centerId')
  const categoryId = searchParams.get('categoryId')

  let query = supabaseAdmin
    .from('sevas')
    .select(`
      *,
      category:seva_categories(id,name),
      center:centers(id,name),
      assignments:seva_assignments(
        id, role, member_id,
        member:members(global_id,name,phone),
        completions:seva_completions(id, completed_date, proof_url, user_suchan, admin_remark)
      )
    `)
    .eq('active', true)
    .order('name')

  if (session.role === 'center_admin') {
    query = query.eq('center_id', session.centerId!)
  } else if (centerId) {
    query = query.eq('center_id', centerId)
  }
  if (categoryId) query = query.eq('category_id', categoryId)

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
    .from('sevas')
    .insert({
      category_id: body.category_id,
      center_id:   centerId,
      name:        body.name,
      description: body.description,
      frequency:   body.frequency,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
