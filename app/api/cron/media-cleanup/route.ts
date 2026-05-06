import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

  // Find expired media
  const { data: expired, error } = await supabaseAdmin
    .from('seva_completions')
    .select('id, proof_public_id, remark_media_public_id')
    .lt('media_expires_at', now)
    .or('proof_public_id.not.is.null,remark_media_public_id.not.is.null')

  if (error) {
    console.error('[MediaCleanup] DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!expired?.length) {
    return NextResponse.json({ ok: true, deleted: 0 })
  }

  // Collect public_ids
  const publicIds: string[] = []
  const ids: string[]       = []

  for (const row of expired) {
    if (row.proof_public_id)        publicIds.push(row.proof_public_id)
    if (row.remark_media_public_id) publicIds.push(row.remark_media_public_id)
    ids.push(row.id)
  }

  // Delete from Cloudinary
  try {
    await bulkDeleteFromCloudinary(publicIds)
  } catch (err) {
    console.error('[MediaCleanup] Cloudinary error:', err)
  }

  // Nullify media fields in DB (keep text records)
  await supabaseAdmin
    .from('seva_completions')
    .update({
      proof_url:              null,
      proof_public_id:        null,
      remark_media_url:       null,
      remark_media_public_id: null,
      media_expires_at:       null,
    })
    .in('id', ids)

  console.log(`[MediaCleanup] Deleted ${publicIds.length} media files from ${ids.length} completions`)
  return NextResponse.json({ ok: true, deleted: publicIds.length, completions: ids.length })
}
