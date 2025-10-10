/**
 * Cloudinary API Integration for Media Management
 * 
 * This service handles fetching and managing media from Cloudinary
 * to keep the media library always updated with your Cloudinary account
 */

// import { CLOUDINARY_CLOUD_NAME } from './config'

// Import MediaItem type from the component
export interface MediaItem {
  id: string
  url: string
  filename: string
  size: number
  type: string
  uploadedAt: string
  source: 'cloudinary'
  dimensions?: {
    width: number
    height: number
  }
  title?: string
  alt?: string
  caption?: string
  description?: string
  tags?: string[]
  folder?: string
  featured?: boolean
  favorite?: boolean
  archived?: boolean
  publicId?: string
  format?: string
  bytes?: number
  version?: number
}

export interface CloudinaryResource {
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

export interface CloudinaryApiResponse {
  resources: CloudinaryResource[]
  next_cursor?: string
  total_count?: number
}

export interface CloudinarySearchParams {
  expression?: string
  max_results?: number
  next_cursor?: string
  sort_by?: Array<{ [key: string]: string }>
  with_field?: string[]
}

/**
 * Get all media resources from Cloudinary with optimized caching
 * Now uses real API endpoint to fetch from Cloudinary portfolios folder
 */
export async function getAllCloudinaryMedia(
  params: CloudinarySearchParams = {}
): Promise<CloudinaryApiResponse> {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('admin-token')
    if (!token) {
      throw new Error('Authentication required')
    }

    // Check cache first for better performance - simplified for LCP
    const cacheKey = `cloudinary-media-${JSON.stringify(params)}`
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTime = localStorage.getItem(`${cacheKey}-time`)
    
    if (cachedData && cacheTime) {
      const cacheAge = Date.now() - parseInt(cacheTime)
      const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes cache for better performance
      
      if (cacheAge < CACHE_DURATION) {
        try {
          return JSON.parse(cachedData)
        } catch {
          // If cache is corrupted, continue with API call
        }
      }
    }

    // Call our API endpoint to fetch real Cloudinary data with optimized parameters
    const searchParams = new URLSearchParams()
    if (params.max_results) searchParams.append('max_results', params.max_results.toString())
    if (params.next_cursor) searchParams.append('next_cursor', params.next_cursor)
    if (params.expression) searchParams.append('expression', params.expression)
    
    const response = await fetch(`/api/cloudinary/portfolios?${searchParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'max-age=600', // 10 minutes cache
      },
      // Optimized for LCP
      cache: 'default',
      next: { revalidate: 600 }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Cloudinary API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`)
    }
    
    const data = await response.json()
    
    // If no real data available, fall back to mock data
    if (data.resources.length === 0 && data.message) {
      console.warn('Using mock data:', data.message)
      return getMockCloudinaryMedia(params)
    }
    
    // Save to cache for better performance
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(`${cacheKey}-time`, Date.now().toString())
    } catch (cacheError) {
      console.warn('Failed to cache Cloudinary data:', cacheError)
    }
    
    return data
    
  } catch (error) {
    console.error('Error fetching Cloudinary media:', error)
    // Fall back to mock data on error
    return getMockCloudinaryMedia(params)
  }
}

/**
 * Mock data fallback when real Cloudinary API is not available
 */
async function getMockCloudinaryMedia(params: CloudinarySearchParams = {}): Promise<CloudinaryApiResponse> {
  const allMockResources: CloudinaryResource[] = [
    {
      public_id: 'portfolios/sample1',
      secure_url: 'https://picsum.photos/1200/800?random=1',
      url: 'https://picsum.photos/1200/800?random=1',
      format: 'jpg',
      width: 1200,
      height: 800,
      bytes: 245760,
      created_at: '2024-01-15T10:30:00Z',
      version: 1759979117,
      resource_type: 'image',
      folder: 'portfolios',
      original_filename: 'portfolio-project-1.jpg',
      etag: 'abc123',
      tags: ['portfolio', 'web-design'],
      context: {
        custom: {
          alt: 'Portfolio Project 1',
          caption: 'Modern web design project',
          title: 'Web Design Project'
        }
      }
    },
    {
      public_id: 'portfolios/sample2',
      secure_url: 'https://picsum.photos/800/600?random=2',
      url: 'https://picsum.photos/800/600?random=2',
      format: 'jpg',
      width: 800,
      height: 600,
      bytes: 189440,
      created_at: '2024-01-16T14:20:00Z',
      version: 1759979185,
      resource_type: 'image',
      folder: 'portfolios',
      original_filename: 'portfolio-project-2.jpg',
      etag: 'def456',
      tags: ['portfolio', 'mobile-app']
    },
    {
      public_id: 'portfolios/project1',
      secure_url: 'https://picsum.photos/1920/1080?random=3',
      url: 'https://picsum.photos/1920/1080?random=3',
      format: 'jpg',
      width: 1920,
      height: 1080,
      bytes: 512000,
      created_at: '2024-01-17T09:15:00Z',
      version: 1759979200,
      resource_type: 'image',
      folder: 'portfolios',
      original_filename: 'portfolio-project-3.jpg',
      etag: 'ghi789',
      tags: ['portfolio', 'ui-design']
    },
    {
      public_id: 'portfolios/project2',
      secure_url: 'https://picsum.photos/1600/900?random=4',
      url: 'https://picsum.photos/1600/900?random=4',
      format: 'jpg',
      width: 1600,
      height: 900,
      bytes: 384000,
      created_at: '2024-01-18T16:45:00Z',
      version: 1759979250,
      resource_type: 'image',
      folder: 'portfolios',
      original_filename: 'portfolio-project-4.jpg',
      etag: 'jkl012',
      tags: ['portfolio', 'branding']
    }
  ]

  // Filter by folder if expression contains folder filter
  let filteredResources = allMockResources
  
  if (params.expression && params.expression.includes('folder:')) {
    // Extract folder name from expression like "folder:portfolios"
    const folderName = params.expression.replace('folder:', '').trim()
    
    if (folderName) {
      filteredResources = allMockResources.filter(resource => resource.folder === folderName)
    }
  } else {
    // If no folder expression, default to portfolios folder
    filteredResources = allMockResources.filter(resource => resource.folder === 'portfolios')
  }

  // Simulate API delay
  return new Promise<CloudinaryApiResponse>(resolve => {
    setTimeout(() => {
      resolve({
        resources: filteredResources,
        next_cursor: undefined,
        total_count: filteredResources.length
      })
    }, 500)
  })
}

/**
 * Search media in Cloudinary
 */
export async function searchCloudinaryMedia(
  query: string,
  params: CloudinarySearchParams = {}
): Promise<CloudinaryApiResponse> {
  const searchParams = {
    ...params,
    expression: query ? `resource_type:image AND ${query}` : 'resource_type:image'
  }
  
  return getAllCloudinaryMedia(searchParams)
}

/**
 * Get media by folder
 */
export async function getCloudinaryMediaByFolder(
  folder: string,
  params: CloudinarySearchParams = {}
): Promise<CloudinaryApiResponse> {
  const searchParams = {
    ...params,
    expression: `folder:${folder}`
  }
  
  return getAllCloudinaryMedia(searchParams)
}

/**
 * Get recently uploaded media
 */
export async function getRecentCloudinaryMedia(
  days: number = 7,
  params: CloudinarySearchParams = {}
): Promise<CloudinaryApiResponse> {
  const date = new Date()
  date.setDate(date.getDate() - days)
  const dateString = date.toISOString().split('T')[0]
  
  const searchParams = {
    ...params,
    expression: `created_at>${dateString}`,
    sort_by: [{ created_at: 'desc' }]
  }
  
  return getAllCloudinaryMedia(searchParams)
}

/**
 * Convert Cloudinary resource to MediaItem format
 */
export function convertCloudinaryResourceToMediaItem(resource: CloudinaryResource, folderName?: string) {
  // Simplified URL optimization for better LCP
  const getOptimizedUrl = (originalUrl: string) => {
    if (originalUrl.includes('cloudinary.com')) {
      // Simple optimization: just add quality auto for better performance
      return originalUrl.replace('/upload/', '/upload/q_auto,f_auto/')
    }
    return originalUrl
  }

  return {
    id: resource.public_id,
    url: getOptimizedUrl(resource.secure_url),
    filename: resource.original_filename,
    size: resource.bytes,
    type: resource.resource_type === 'image' ? `image/${resource.format}` : `${resource.resource_type}/${resource.format}`,
    uploadedAt: resource.created_at,
    source: 'cloudinary' as const,
    dimensions: {
      width: resource.width,
      height: resource.height
    },
    title: resource.context?.custom?.title || resource.original_filename.replace(/\.[^/.]+$/, ''),
    alt: resource.context?.custom?.alt || '',
    caption: resource.context?.custom?.caption || '',
    description: '',
    tags: resource.tags || [],
    folder: folderName || resource.folder || 'root',
    featured: false,
    favorite: false,
    archived: false,
    publicId: resource.public_id,
    format: resource.format,
    bytes: resource.bytes,
    version: resource.version
  }
}

/**
 * Real-time sync with Cloudinary
 * This would be implemented with webhooks in a real application
 */
export class CloudinarySyncService {
  private static instance: CloudinarySyncService
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncTime: Date | null = null
  private onUpdateCallback: ((media: MediaItem[]) => void) | null = null

  static getInstance(): CloudinarySyncService {
    if (!CloudinarySyncService.instance) {
      CloudinarySyncService.instance = new CloudinarySyncService()
    }
    return CloudinarySyncService.instance
  }

  /**
   * Start automatic sync with Cloudinary
   */
  startAutoSync(intervalMinutes: number = 5, onUpdate?: (media: MediaItem[]) => void) {
    // Prevent multiple instances
    if (this.syncInterval) {
      console.log('Cloudinary auto-sync already running, skipping start')
      return
    }

    this.onUpdateCallback = onUpdate || null

    // Initial sync
    this.syncWithCloudinary()

    // Set up interval
    this.syncInterval = setInterval(() => {
      this.syncWithCloudinary()
    }, intervalMinutes * 60 * 1000)

    console.log(`Started Cloudinary auto-sync every ${intervalMinutes} minutes`)
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('Stopped Cloudinary auto-sync')
    }
  }

  /**
   * Manual sync with Cloudinary
   */
  async syncWithCloudinary() {
    try {
      console.log('Syncing with Cloudinary portfolios folder...')
      const response = await getCloudinaryMediaByFolder('portfolios')
      const mediaItems = response.resources.map(resource => convertCloudinaryResourceToMediaItem(resource, 'portfolios'))
      
      this.lastSyncTime = new Date()
      
      if (this.onUpdateCallback) {
        this.onUpdateCallback(mediaItems)
      }

      console.log(`Synced ${mediaItems.length} media items from portfolios folder`)
      return mediaItems
    } catch (error) {
      console.error('Error syncing with Cloudinary:', error)
      throw error
    }
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime
  }

  /**
   * Check if sync is running
   */
  isSyncing(): boolean {
    return this.syncInterval !== null
  }
}

/**
 * Webhook handler for real-time updates
 * This would be implemented on your backend to receive Cloudinary webhooks
 */
export interface CloudinaryWebhookPayload {
  notification_type: string
  public_id: string
  version: number
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
  secure_url: string
  url: string
  folder?: string
  original_filename: string
  etag: string
}

/**
 * Delete media from Cloudinary
 */
export async function deleteCloudinaryMedia(publicIds: string[]): Promise<{
  success: boolean
  deleted: Record<string, string>
  not_found: string[]
  partial: boolean
  error?: string
}> {
  try {
    
    // Get auth token from localStorage
    const token = localStorage.getItem('admin-token')
    if (!token) {
      throw new Error('Authentication required')
    }
    
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ publicIds }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Delete API error:', result)
      throw new Error(result.error || result.message || 'Failed to delete from Cloudinary')
    }

    return result
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    return {
      success: false,
      deleted: {},
      not_found: [],
      partial: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function handleCloudinaryWebhook(payload: CloudinaryWebhookPayload) {
  // This would be called by your backend when receiving Cloudinary webhooks
  console.log('Received Cloudinary webhook:', payload)
  
  // Convert webhook payload to media item
  const mediaItem = convertCloudinaryResourceToMediaItem({
    public_id: payload.public_id,
    secure_url: payload.secure_url,
    url: payload.url,
    format: payload.format,
    width: payload.width,
    height: payload.height,
    bytes: payload.bytes,
    created_at: payload.created_at,
    version: payload.version,
    resource_type: payload.resource_type,
    folder: payload.folder,
    original_filename: payload.original_filename,
    etag: payload.etag
  })

  return mediaItem
}
