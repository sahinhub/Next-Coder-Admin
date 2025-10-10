"use client"

import { useState } from 'react'
import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: React.ReactNode
  [key: string]: unknown
}

export function SafeImage({ 
  src, 
  alt, 
  width = 400, 
  height = 300, 
  className = '', 
  fallback,
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
        {...props}
      >
        {fallback || (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">Image not found</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
          style={{ width, height }}
        >
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full h-full" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  )
}
