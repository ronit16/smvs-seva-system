import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { addDays } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const centerId = searchParams.get('centerId')
  const memberId = searchParams.get('memberId')

  let query = supabaseAdmin
    .from('seva_completions')
    .select(`
      *,
      member:members(global_id,name),
      seva:sevas(id,name,frequency,category:seva_categories(name)),
      assignment:seva_assignments(id,role)
    `)
    .order('completed_date', { ascending: false })

  if (session.role === 'center_admin') {
    query = query.eq('center_id', session.centerId!)
  } else if (session.role === 'member') {
    query = query.eq('member_id', session.memberGlobalId!)
  } else if (centerId) {
    query = query.eq('center_id', centerId)
  }
  if (memberId) query = query.eq('member_id', memberId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const body = await req.json()
  const { assignment_id, completed_date, proof_url, proof_public_id, user_suchan } = body

  // Fetch assignment to get meta
  const { data: assignment, error: aErr } = await supabaseAdmin
    .from('seva_assignments')
    .select('member_id, seva_id, center_id')
    .eq('id', assignment_id)
    .single()

  if (aErr || !assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

  // Member can only submit their own
  if (session.role === 'member' && assignment.member_id !== session.memberGlobalId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const media_expires_at = proof_url
    ? addDays(new Date(), 30).toISOString()
    : null

  const { data, error } = await supabaseAdmin
    .from('seva_completions')
    .insert({
      assignment_id,
      member_id:       assignment.member_id,
      seva_id:         assignment.seva_id,
      center_id:       assignment.center_id,
      completed_date,
      proof_url,
      proof_public_id,
      user_suchan,
      media_expires_at,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
