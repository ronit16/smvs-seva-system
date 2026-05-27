import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { addDays } from 'date-fns'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session || session.role === 'member') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { admin_remark, remark_media_url, remark_media_public_id } = body

  try {
    let data
    if (remark_media_url) {
      const remark_media_expires_at = addDays(new Date(), 30).toISOString()
      ;[data] = await sql`
        UPDATE seva_completions
        SET admin_remark             = ${admin_remark || null},
            remark_media_url         = ${remark_media_url},
            remark_media_public_id   = ${remark_media_public_id || null},
            remark_media_expires_at  = ${remark_media_expires_at}
        WHERE id = ${params.id}
        RETURNING *
      `
    } else {
      ;[data] = await sql`
        UPDATE seva_completions
        SET admin_remark = ${admin_remark || null}
        WHERE id = ${params.id}
        RETURNING *
      `
    }

    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
