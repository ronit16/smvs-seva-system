import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const sevaId = new URL(req.url).searchParams.get('sevaId')
  if (!sevaId) return NextResponse.json({ error: 'sevaId required' }, { status: 400 })

  const memberGlobalId =
    session.role === 'member' ? session.memberGlobalId : null

  // For member sessions: verify the requesting member is actually in this seva
  if (session.role === 'member') {
    const check = await sql`
      SELECT 1 FROM seva_assignments
      WHERE seva_id = ${sevaId} AND member_id = ${memberGlobalId!}
      LIMIT 1
    `
    if (!check.length) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } else if (session.role !== 'center_admin' && session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const team = await sql`
    SELECT
      sa.role,
      json_build_object(
        'global_id', m.global_id,
        'name',      m.name,
        'phone',     m.phone
      ) AS member
    FROM seva_assignments sa
    JOIN members m ON m.global_id = sa.member_id
    WHERE sa.seva_id = ${sevaId}
    ORDER BY sa.role DESC, m.name ASC
  `

  return NextResponse.json({ data: team })
}
