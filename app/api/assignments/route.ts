import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import {
  sendWhatsApp,
  msgAssignmentLeader,
  msgAssignmentMember,
} from '@/lib/whatsapp'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const sevaId   = searchParams.get('sevaId')
  const memberId = searchParams.get('memberId')   // for member view

  let query = supabaseAdmin
    .from('seva_assignments')
    .select(`
      *,
      seva:sevas(id,name,description,frequency,category:seva_categories(name)),
      member:members(global_id,name,phone),
      completions:seva_completions(id,completed_date,proof_url,user_suchan,admin_remark,remark_media_url)
    `)
    .order('created_at', { ascending: false })

  if (session.role === 'center_admin') {
    query = query.eq('center_id', session.centerId!)
  }
  if (session.role === 'member') {
    query = query.eq('member_id', session.memberGlobalId!)
  }
  if (sevaId)   query = query.eq('seva_id', sevaId)
  if (memberId) query = query.eq('member_id', memberId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  // body = { sevaId, leaderId, memberIds: string[], centerId? }

  const centerId = session.role === 'center_admin' ? session.centerId! : body.centerId
  const { sevaId, leaderId, memberIds } = body

  if (!sevaId || !leaderId) {
    return NextResponse.json({ error: 'sevaId and leaderId required' }, { status: 400 })
  }

  // Remove existing assignments for this seva
  await supabaseAdmin.from('seva_assignments').delete().eq('seva_id', sevaId).eq('center_id', centerId)

  // Insert leader
  const rows = [
    { seva_id: sevaId, member_id: leaderId, center_id: centerId, role: 'leader' },
    ...(memberIds || [])
      .filter((id: string) => id !== leaderId)
      .map((id: string) => ({ seva_id: sevaId, member_id: id, center_id: centerId, role: 'member' })),
  ]

  const { data: inserted, error } = await supabaseAdmin
    .from('seva_assignments')
    .insert(rows)
    .select(`
      *,
      member:members(global_id,name,phone),
      seva:sevas(name,frequency,center:centers(name))
    `)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ── WhatsApp Notifications (fire-and-forget) ──────────────────
  try {
    const leader = inserted?.find(a => a.role === 'leader')
    const members = inserted?.filter(a => a.role === 'member') || []
    const seva = leader?.seva

    if (leader?.member && seva) {
      const centerName = seva.center?.name || 'SMVS Center'
      // Notify leader
      await sendWhatsApp(
        leader.member.phone,
        msgAssignmentLeader({
          leaderName:  leader.member.name,
          sevaName:    seva.name,
          frequency:   seva.frequency,
          centerName,
          memberNames: members.map((m: any) => m.member?.name).filter(Boolean),
        })
      )
      // Notify each member
      for (const m of members) {
        if (m.member?.phone) {
          await sendWhatsApp(
            m.member.phone,
            msgAssignmentMember({
              memberName:  m.member.name,
              sevaName:    seva.name,
              frequency:   seva.frequency,
              centerName,
              leaderName:  leader.member.name,
              leaderPhone: leader.member.phone,
            })
          )
        }
      }
    }
  } catch (wpErr) {
    console.error('[WhatsApp assignment notification]', wpErr)
  }

  return NextResponse.json({ data: inserted }, { status: 201 })
}
