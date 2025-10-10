'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { type ImageUploadResponse } from '@/lib/imageUpload'

interface ImageUploadProps {
  onUploadSuccess: (result: ImageUploadResponse) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  acceptedTypes?: string[]
  className?: string
  allowMultiple?: boolean
  title?: string
  description?: string
  supportText?: string
  maxSize?: number // in bytes
}


export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  maxFiles = 1,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  allowMultiple = false,
  title = 'Upload Project Thumbnail',
  description = 'Drag and drop your thumbnail here, or click to browse',
  supportText = 'Supports: JPG, PNG, WebP (max 32MB) for thumbnail',
  maxSize = 32 * 1024 * 1024 // 32MB default
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  
  const { uploadImage, isUploading, progress, error, clearError, validateFile } = useImageUpload()

  const handleFiles = useCallback(async (files: FileList) => {
    clearError()
    
    if (files.length > maxFiles) {
      onUploadError?.('Too many files selected')
      return
    }

    const file = files[0]
    
    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      onUploadError?.(`File size must be less than ${maxSizeMB}MB`)
      return
    }
    
    const validation = validateFile(file)
    
    if (!validation.valid) {
      onUploadError?.(validation.error || 'Invalid file')
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setPreviewUrls([previewUrl])

    try {
      const result = await uploadImage(file)
      onUploadSuccess(result)
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl)
      setPreviewUrls([])
    } catch (err) {
      onUploadError?.(err instanceof Error ? err.message : 'Upload failed')
      // Clean up preview URL on error
      URL.revokeObjectURL(previewUrl)
      setPreviewUrls([])
    }
  }, [maxFiles, maxSize, validateFile, uploadImage, onUploadSuccess, onUploadError, clearError])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-colors ${
          dragActive
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          {isUploading ? (
            // Skeleton Loading State
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Upload className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
              
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
              <Skeleton className="h-3 w-56 mx-auto" />
              
              <div className="pt-2">
                <Skeleton className="h-10 w-32 mx-auto rounded-md" />
              </div>
            </div>
          ) : (
            // Normal State
            <div className="text-center">
              <div className="mx-auto w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {description}
              </p>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                {supportText}
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={openFileDialog}
                className="mt-2"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
            multiple={allowMultiple && maxFiles > 1}
          />
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Uploading...</span>
            <span className="text-gray-600 dark:text-gray-400 font-mono">{progress}%</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="w-full h-2" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* Preview - Simplified for better LCP */}
      {previewUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Preview:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                {isUploading ? (
                  <div className="w-full h-24 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : (
                  <>
                    <Image
                      src={url}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      priority={index < 2} // Only prioritize first 2 images
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          URL.revokeObjectURL(url)
                          setPreviewUrls(prev => prev.filter((_, i) => i !== index))
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearError}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Success Message */}
      {!isUploading && !error && progress === 100 && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm text-green-700 dark:text-green-300">Upload successful!</span>
        </div>
      )}
    </div>
  )
}
