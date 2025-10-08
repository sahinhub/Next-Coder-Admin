'use client'

import { useState, useCallback } from 'react'
import { uploadImageWithProgress, validateImageFile, formatFileSize, type ImageUploadResponse, type UploadProgress } from '@/lib/imageUpload'

export interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<ImageUploadResponse>
  isUploading: boolean
  progress: number
  error: string | null
  clearError: () => void
  validateFile: (file: File) => { valid: boolean; error?: string }
  formatFileSize: (bytes: number) => string
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = useCallback(async (file: File): Promise<ImageUploadResponse> => {
    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Validate file first
      const validation = validateImageFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Upload with progress tracking
      const result = await uploadImageWithProgress(file, (progressData: UploadProgress) => {
        setProgress(progressData.percentage)
      })

      setProgress(100)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    clearError,
    validateFile: validateImageFile,
    formatFileSize
  }
}
