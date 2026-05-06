import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const folder   = (formData.get('folder') as string) || 'seva-proofs'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Validate file type
  const allowedTypes = ['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/quicktime']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  // Validate file size (max 50MB)
  const MAX_BYTES = 50 * 1024 * 1024
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const resourceType = file.type.startsWith('video') ? 'video' : 'image'

    const result = await uploadToCloudinary(
      buffer,
      folder as 'seva-proofs' | 'sant-remarks',
      resourceType,
    )

    return NextResponse.json({ data: result })
  } catch (err: any) {
    console.error('[Upload]', err)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}

// Required for file uploads
export const config = { api: { bodyParser: false } }
