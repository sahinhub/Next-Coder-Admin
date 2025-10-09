import { NextRequest, NextResponse } from 'next/server'

const CLOUDINARY_CLOUD_NAME = 'dzvhuak8p'
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

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

interface CloudinaryResource {
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
  tags?: string[]
  context?: {
    custom?: {
      alt?: string
      caption?: string
      title?: string
    }
  }
}

interface CloudinaryApiResponse {
  resources: CloudinaryResource[]
  next_cursor?: string
  total_count: number
}

export async function GET(request: NextRequest) {
  // SECURITY: Authenticate request
  if (!authenticateRequest(request)) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    )
  }

  try {
    // Check if API credentials are available
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary API credentials not found, using mock data')
      return NextResponse.json({
        resources: [],
        total_count: 0,
        message: 'Cloudinary API credentials not configured. Please add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to your environment variables.'
      })
    }

    // Fetch media from portfolios folder using Cloudinary Admin API
    const searchParams = new URLSearchParams({
      expression: 'folder:portfolios',
      resource_type: 'image',
      max_results: '500' // Adjust as needed
    })

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Transform the response to match our expected format
    const transformedResources: CloudinaryResource[] = data.resources.map((resource: Record<string, unknown>) => ({
      public_id: String(resource.public_id || ''),
      secure_url: String(resource.secure_url || ''),
      url: String(resource.url || ''),
      format: String(resource.format || ''),
      width: Number(resource.width || 0),
      height: Number(resource.height || 0),
      bytes: Number(resource.bytes || 0),
      created_at: String(resource.created_at || ''),
      version: Number(resource.version || 0),
      resource_type: String(resource.resource_type || 'image'),
      folder: String(resource.folder || ''),
      original_filename: String(resource.original_filename || String(resource.public_id || '').split('/').pop() || 'unknown'),
      etag: String(resource.etag || ''),
      tags: Array.isArray(resource.tags) ? resource.tags as string[] : [],
      context: (resource.context as Record<string, unknown>) || {}
    }))

    const result: CloudinaryApiResponse = {
      resources: transformedResources,
      next_cursor: data.next_cursor,
      total_count: data.total_count || transformedResources.length
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching Cloudinary portfolios:', error)
    
    // Return empty result on error
    return NextResponse.json({
      resources: [],
      total_count: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}
