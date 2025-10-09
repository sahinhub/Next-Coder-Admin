/**
 * Cloudinary API Integration for Portfolio Image Uploads
 * 
 * Benefits:
 * - Professional image management
 * - Automatic optimization and transformations
 * - CDN delivery
 * - Free tier: 25GB storage, 25GB bandwidth
 * - Multiple format support
 */

import { 
  uploadImageToCloudinary as cloudinaryUpload, 
  uploadImageWithProgress as cloudinaryUploadWithProgress, 
  getOptimizedImageUrl as cloudinaryGetOptimizedUrl, 
  validateImageFile as cloudinaryValidateFile, 
  formatFileSize as cloudinaryFormatFileSize,
  type UploadProgress
} from './cloudinaryUpload'

export interface ImageUploadResponse {
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

export { type UploadProgress } from './cloudinaryUpload'

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
): Promise<ImageUploadResponse> {
  return cloudinaryUpload(file, onProgress, folder)
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
): Promise<ImageUploadResponse> {
  return cloudinaryUploadWithProgress(file, onProgress, folder)
}

/**
 * Get optimized image URL for different sizes
 * @param originalUrl - The original Cloudinary URL
 * @param size - Desired size ('thumb', 'medium', 'large', 'original')
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(originalUrl: string, size: 'thumb' | 'medium' | 'large' | 'original' = 'medium'): string {
  return cloudinaryGetOptimizedUrl(originalUrl, size)
}

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  return cloudinaryValidateFile(file)
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted size string
 */
export function formatFileSize(bytes: number): string {
  return cloudinaryFormatFileSize(bytes)
}