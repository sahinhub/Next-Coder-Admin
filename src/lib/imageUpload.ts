/**
 * ImageBB API Integration for Portfolio Image Uploads
 * 
 * Benefits:
 * - No server timeout issues (client-side upload)
 * - Fast CDN delivery
 * - Free tier: 32MB per image, 1GB total
 * - Multiple format support
 */

import { IMAGEBB_API_KEY, IMAGEBB_UPLOAD_URL } from './config'

export interface ImageUploadResponse {
  success: boolean
  data?: {
    id: string
    title: string
    url_viewer: string
    url: string
    display_url: string
    width: string
    height: string
    size: string
    time: string
    expiration: string
    image: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    thumb: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    medium: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
  }
  error?: {
    message: string
    code: number
  }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

/**
 * Upload image to ImageBB
 * @param file - The image file to upload
 * @param onProgress - Optional progress callback
 * @returns Promise with upload result
 */
export async function uploadImageToImageBB(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ImageUploadResponse> {
  // Validate file
  if (!file) {
    throw new Error('No file provided')
  }

  // Check file size (32MB limit for free tier)
  const maxSize = 32 * 1024 * 1024 // 32MB
  if (file.size > maxSize) {
    throw new Error('File size exceeds 32MB limit')
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed')
  }

  // Use ImageBB API key from config
  const apiKey = IMAGEBB_API_KEY
  if (!apiKey) {
    throw new Error('ImageBB API key not configured')
  }

  // Create FormData
  const formData = new FormData()
  formData.append('image', file)
  formData.append('key', apiKey)

  // Optional: Add expiration (default is 1 hour, max 6 months)
  // formData.append('expiration', '2592000') // 30 days

  try {
    const response = await fetch(IMAGEBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
      // Note: We can't track upload progress with fetch API
      // For progress tracking, you'd need XMLHttpRequest
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    const result: ImageUploadResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error?.message || 'Upload failed')
    }

    return result
  } catch (error) {
    console.error('ImageBB upload error:', error)
    throw error
  }
}

/**
 * Upload image with progress tracking using XMLHttpRequest
 * @param file - The image file to upload
 * @param onProgress - Progress callback
 * @returns Promise with upload result
 */
export async function uploadImageWithProgress(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ImageUploadResponse> {
  return new Promise((resolve, reject) => {
    // Validate file
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    // Check file size
    const maxSize = 32 * 1024 * 1024 // 32MB
    if (file.size > maxSize) {
      reject(new Error('File size exceeds 32MB limit'))
      return
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      reject(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed'))
      return
    }

    const apiKey = IMAGEBB_API_KEY
    if (!apiKey) {
      reject(new Error('ImageBB API key not configured'))
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('key', apiKey)

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
          const result: ImageUploadResponse = JSON.parse(xhr.responseText)
          if (result.success) {
            resolve(result)
          } else {
            reject(new Error(result.error?.message || 'Upload failed'))
          }
        } catch (error) {
          reject(new Error('Invalid response from server'))
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timeout'))
    })

    // Set timeout (30 seconds)
    xhr.timeout = 30000

    // Start upload
    xhr.open('POST', IMAGEBB_UPLOAD_URL)
    xhr.send(formData)
  })
}

/**
 * Get optimized image URL for different sizes
 * @param originalUrl - The original ImageBB URL
 * @param size - Desired size ('thumb', 'medium', 'large')
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(originalUrl: string, size: 'thumb' | 'medium' | 'large' = 'medium'): string {
  // ImageBB provides different sizes automatically
  // You can modify the URL to get different sizes
  if (size === 'thumb') {
    return originalUrl.replace('/image/', '/thumb/')
  } else if (size === 'medium') {
    return originalUrl.replace('/image/', '/medium/')
  }
  return originalUrl
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

  // Check file size (32MB limit)
  const maxSize = 32 * 1024 * 1024 // 32MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 32MB limit' }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed' }
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
