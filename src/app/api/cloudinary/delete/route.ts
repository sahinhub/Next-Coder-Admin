import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Authentication middleware
function authenticateRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.substring(7)
  // In production, verify JWT token here
  // For now, check if token exists and is not empty
  return token.length > 0
}

export async function DELETE(request: NextRequest) {
  // SECURITY: Authenticate request
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    )
  }
  try {
    const { publicIds } = await request.json()

    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      console.error('No public IDs provided')
      return NextResponse.json(
        { error: 'No public IDs provided' },
        { status: 400 }
      )
    }

    // Check if Cloudinary credentials are available
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials not configured')
      return NextResponse.json(
        { 
          error: 'Cloudinary credentials not configured',
          message: 'Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your environment variables'
        },
        { status: 500 }
      )
    }


    // Delete resources from Cloudinary
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image',
      type: 'upload'
    })


    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      not_found: result.not_found,
      partial: result.partial
    })

  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete from Cloudinary',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}
