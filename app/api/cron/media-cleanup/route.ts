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

  // Find rows with expired proof media
  const { data: expiredProof, error: proofError } = await supabaseAdmin
    .from('seva_completions')
    .select('id, proof_public_id')
    .lt('media_expires_at', now)
    .not('proof_public_id', 'is', null)

  // Find rows with expired remark media
  const { data: expiredRemark, error: remarkError } = await supabaseAdmin
    .from('seva_completions')
    .select('id, remark_media_public_id')
    .lt('remark_media_expires_at', now)
    .not('remark_media_public_id', 'is', null)

  if (proofError || remarkError) {
    const err = proofError || remarkError
    console.error('[MediaCleanup] DB error:', err)
    return NextResponse.json({ error: err!.message }, { status: 500 })
  }

  const publicIds: string[] = []
  const proofIds: string[]  = []
  const remarkIds: string[] = []

  for (const row of expiredProof ?? []) {
    publicIds.push(row.proof_public_id)
    proofIds.push(row.id)
  }

  for (const row of expiredRemark ?? []) {
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
    await supabaseAdmin
      .from('seva_completions')
      .update({ proof_url: null, proof_public_id: null, media_expires_at: null })
      .in('id', proofIds)
  }

  // Nullify remark media fields
  if (remarkIds.length) {
    await supabaseAdmin
      .from('seva_completions')
      .update({ remark_media_url: null, remark_media_public_id: null, remark_media_expires_at: null })
      .in('id', remarkIds)
  }

  const total = proofIds.length + remarkIds.length
  console.log(`[MediaCleanup] Deleted ${publicIds.length} media files (${proofIds.length} proof, ${remarkIds.length} remark)`)
  return NextResponse.json({ ok: true, deleted: publicIds.length, completions: total })
}
