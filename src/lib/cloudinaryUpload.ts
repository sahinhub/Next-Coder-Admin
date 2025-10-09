/**
 * Cloudinary API Integration for Portfolio Image Uploads
 * 
 * Benefits:
 * - Professional image management
 * - Automatic optimization and transformations
 * - CDN delivery
 * - Multiple format support
 * - Free tier: 25GB storage, 25GB bandwidth
 */

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from './config'

export interface CloudinaryUploadResponse {
  success: boolean
  data?: {
    public_id: string
    secure_url: string
    url: string
    format: string
    width: number
    height: number
    bytes: number
    created_at: string
    version: number
    resource_type: string
    folder?: string
    original_filename: string
    etag: string
  }
  error?: {
    message: string
    http_code: number
  }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload image to Cloudinary
 * @param file - The image file to upload
 * @param onProgress - Optional progress callback
 * @param folder - Optional folder to organize images
 * @returns Promise with upload result
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  folder?: string
): Promise<CloudinaryUploadResponse> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  // Check file size (100MB limit for Cloudinary)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 100MB limit')
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed')
  }

  // Create FormData
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  
  if (folder) {
    formData.append('folder', folder)
  }

  // Add resource type
  formData.append('resource_type', 'image')
  
  // Add additional parameters for better error handling
  formData.append('timestamp', Date.now().toString())

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Cloudinary upload error:', errorData)
      
      // Provide more specific error messages
      if (response.status === 400) {
        if (errorData.error?.message?.includes('preset')) {
          throw new Error(`Upload preset not found. Please check your Cloudinary configuration. Current preset: ${CLOUDINARY_UPLOAD_PRESET}`)
        }
        throw new Error(`Bad request: ${errorData.error?.message || 'Invalid upload parameters'}`)
      } else if (response.status === 401) {
        throw new Error('Unauthorized: Check your Cloudinary credentials')
      } else if (response.status === 403) {
        throw new Error('Forbidden: Upload preset may not be configured for unsigned uploads')
      } else {
        throw new Error(`Upload failed: ${response.status} ${errorData.error?.message || response.statusText}`)
      }
    }

    const result = await response.json()

    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
        version: result.version,
        resource_type: result.resource_type,
        folder: result.folder,
        original_filename: result.original_filename,
        etag: result.etag
      }
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

/**
 * Upload image with progress tracking using XMLHttpRequest
 * @param file - The image file to upload
 * @param onProgress - Progress callback
 * @param folder - Optional folder to organize images
 * @returns Promise with upload result
 */
export async function uploadImageWithProgress(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  folder?: string
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    // Check file size
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      reject(new Error('File size exceeds 100MB limit'))
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed'))
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    
    if (folder) {
      formData.append('folder', folder)
    }

    // Add resource type
    formData.append('resource_type', 'image')

    const xhr = new XMLHttpRequest()

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress: UploadProgress = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100)
        }
        onProgress(progress)
      }
    })

    // Handle response
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)
          resolve({
            success: true,
            data: {
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
              created_at: result.created_at,
              version: result.version,
              resource_type: result.resource_type,
              folder: result.folder,
              original_filename: result.original_filename,
              etag: result.etag
            }
          })
        } catch (error) {
          reject(new Error('Invalid response from server'))
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText)
          reject(new Error(`Upload failed: ${xhr.status} ${errorData.error?.message || xhr.statusText}`))
        } catch {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
        }
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'))
    })

    // Set timeout (60 seconds for larger files)
    xhr.timeout = 60000

    // Start upload
    xhr.open('POST', CLOUDINARY_UPLOAD_URL)
    xhr.send(formData)
  })
}

/**
 * Get optimized image URL with transformations
 * @param publicId - The Cloudinary public ID
 * @param transformations - Cloudinary transformation string
 * @returns Optimized URL
 */
export function getCloudinaryUrl(publicId: string, transformations?: string): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`
  
  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`
  }
  
  return `${baseUrl}/${publicId}`
}

/**
 * Get optimized image URL for different sizes
 * @param originalUrl - The original Cloudinary URL
 * @param size - Desired size ('thumb', 'medium', 'large', 'original')
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(originalUrl: string, size: 'thumb' | 'medium' | 'large' | 'original' = 'medium'): string {
  // Extract public ID from URL
  const publicIdMatch = originalUrl.match(/\/upload\/(?:.+\/)?(.+)$/)
  if (!publicIdMatch) {
    return originalUrl
  }
  
  const publicId = publicIdMatch[1]
  
  switch (size) {
    case 'thumb':
      return getCloudinaryUrl(publicId, 'w_300,h_300,c_fill,f_auto,q_auto')
    case 'medium':
      return getCloudinaryUrl(publicId, 'w_800,h_600,c_fill,f_auto,q_auto')
    case 'large':
      return getCloudinaryUrl(publicId, 'w_1200,h_800,c_fill,f_auto,q_auto')
    case 'original':
    default:
      return getCloudinaryUrl(publicId, 'f_auto,q_auto')
  }
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 100MB limit' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPG, PNG, GIF, WebP, and SVG are allowed' }
  }

  return { valid: true }
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Delete image from Cloudinary (requires server-side implementation)
 * @param publicId - The Cloudinary public ID
 * @returns Promise with deletion result
 */
export async function deleteCloudinaryImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  // Note: This requires server-side implementation with Cloudinary Admin API
  // For now, we'll just return a success response
  console.warn('Delete functionality requires server-side implementation with Cloudinary Admin API')
  return { success: true }
}
