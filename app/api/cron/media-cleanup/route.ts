import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { bulkDeleteFromCloudinary } from '@/lib/cloudinary'

/**
 * Runs every Sunday at 02:00 (vercel.json: "0 2 * * 0")
 * Deletes Cloudinary media that has passed its 30-day expiry.
 * Text records (remarks, suchan, dates) are NEVER deleted.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const now = new Date().toISOString()

  try {
    const expiredProof = await sql`
      SELECT id, proof_public_id
      FROM seva_completions
      WHERE media_expires_at < ${now}
        AND proof_public_id IS NOT NULL
    `

    const expiredRemark = await sql`
      SELECT id, remark_media_public_id
      FROM seva_completions
      WHERE remark_media_expires_at < ${now}
        AND remark_media_public_id IS NOT NULL
    `

    const publicIds: string[] = []
    const proofIds:  string[] = []
    const remarkIds: string[] = []

    for (const row of expiredProof) {
      publicIds.push(row.proof_public_id)
      proofIds.push(row.id)
    }
    for (const row of expiredRemark) {
      publicIds.push(row.remark_media_public_id)
      remarkIds.push(row.id)
    }

    if (!publicIds.length) {
      return NextResponse.json({ ok: true, deleted: 0 })
    }

    // Delete from Cloudinary
    try {
      await bulkDeleteFromCloudinary(publicIds)
    } catch (err) {
      console.error('[MediaCleanup] Cloudinary error:', err)
    }

    // Nullify proof media fields
    if (proofIds.length) {
      await sql`
        UPDATE seva_completions
        SET proof_url = null, proof_public_id = null, media_expires_at = null
        WHERE id = ANY(${proofIds}::uuid[])
      `
    }

    // Nullify remark media fields
    if (remarkIds.length) {
      await sql`
        UPDATE seva_completions
        SET remark_media_url = null, remark_media_public_id = null, remark_media_expires_at = null
        WHERE id = ANY(${remarkIds}::uuid[])
      `
    }

    const total = proofIds.length + remarkIds.length
    console.log(`[MediaCleanup] Deleted ${publicIds.length} media files (${proofIds.length} proof, ${remarkIds.length} remark)`)
    return NextResponse.json({ ok: true, deleted: publicIds.length, completions: total })
  } catch (err: any) {
    console.error('[MediaCleanup] DB error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
