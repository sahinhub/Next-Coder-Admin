/**
 * Test ImageBB API Integration
 * 
 * This file can be used to test the ImageBB upload functionality
 * Run this in the browser console to verify the API key works
 */

import { uploadImageToImageBB, validateImageFile } from './imageUpload'

export async function testImageBBConnection() {
  console.log('🧪 Testing ImageBB API Connection...')
  
  try {
    // Create a test file (1x1 pixel PNG)
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, 1, 1)
    }
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/png')
    })
    
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' })
    
    // Validate file
    const validation = validateImageFile(testFile)
    console.log('✅ File validation:', validation)
    
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    // Test upload
    console.log('📤 Uploading test image to ImageBB...')
    const result = await uploadImageToImageBB(testFile)
    
    if (result.success && result.data) {
      console.log('✅ ImageBB upload successful!')
      console.log('📊 Upload result:', {
        id: result.data.id,
        url: result.data.url,
        display_url: result.data.display_url,
        size: result.data.size,
        width: result.data.width,
        height: result.data.height
      })
      
      // Test the URL
      const img = new Image()
      img.onload = () => {
        console.log('✅ Image loaded successfully from ImageBB CDN')
        console.log('🌐 Image URL:', result.data?.url)
      }
      img.onerror = () => {
        console.error('❌ Failed to load image from ImageBB CDN')
      }
      img.src = result.data.url
      
      return result
    } else {
      throw new Error('Upload failed: ' + (result.error?.message || 'Unknown error'))
    }
  } catch (error) {
    console.error('❌ ImageBB test failed:', error)
    throw error
  }
}

// Export for manual testing
export function runImageBBTest() {
  return testImageBBConnection()
    .then((result) => {
      console.log('🎉 ImageBB integration test completed successfully!')
      return result
    })
    .catch((error) => {
      console.error('💥 ImageBB integration test failed:', error)
      throw error
    })
}

// Auto-run test if in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-run the test
  // runImageBBTest()
}
