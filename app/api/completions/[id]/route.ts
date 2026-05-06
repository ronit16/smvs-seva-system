import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { addDays } from 'date-fns'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { admin_remark, remark_media_url, remark_media_public_id } = body

  const updateData: Record<string, unknown> = { admin_remark }
  if (remark_media_url) {
    updateData.remark_media_url       = remark_media_url
    updateData.remark_media_public_id = remark_media_public_id
    updateData.media_expires_at       = addDays(new Date(), 30).toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('seva_completions')
    .update(updateData)
    .eq('id', params.id)
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
