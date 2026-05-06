import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadResult {
  url: string
  publicId: string
}

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer - File buffer from FormData
 * @param folder - Cloudinary folder (e.g. 'seva-proofs' | 'sant-remarks')
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: 'seva-proofs' | 'sant-remarks',
  resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `smvs-seva-system/${folder}`,
        resource_type: resourceType,
        transformation: folder === 'seva-proofs'
          ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }]
          : undefined,
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Upload failed'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(buffer)
  })
}

/**
 * Delete a Cloudinary asset by its public_id.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

/**
 * Delete multiple assets by public_ids.
 */
export async function bulkDeleteFromCloudinary(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return
  await cloudinary.api.delete_resources(publicIds)
}

export default cloudinary
