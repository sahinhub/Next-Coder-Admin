'use client'

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Image as ImageIcon,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Grid,
  List,
  RefreshCw,
  MoreVertical,
  Edit,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  Check,
  X,
  Plus,
  Archive,
  Star,
  Heart
} from 'lucide-react'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { type ImageUploadResponse } from '@/lib/imageUpload'
import { 
  CloudinarySyncService, 
  getAllCloudinaryMedia,
  searchCloudinaryMedia,
  convertCloudinaryResourceToMediaItem,
  deleteCloudinaryMedia,
  type MediaItem
} from '@/lib/cloudinaryApi'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

// Memoized Media Card Component for better performance
const MediaCard = memo(({ 
  item, 
  isSelected, 
  onToggleSelect, 
  onShowDetails, 
  onUpdateItem, 
  onDeleteImage, 
  onCopyToClipboard, 
  onDownloadImage 
}: {
  item: MediaItem
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onShowDetails: (item: MediaItem) => void
  onUpdateItem: (id: string, updates: Partial<MediaItem>) => void
  onDeleteImage: (id: string) => void
  onCopyToClipboard: (url: string) => void
  onDownloadImage: (url: string, filename: string) => void
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card 
      className={`group py-0 hover:shadow-lg transition-all duration-200 w-full cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={() => onToggleSelect(item.id)}
    >
      <CardContent className="p-0">
        <div className="relative h-36 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
          <Image
            src={item.url}
            alt={item.alt || item.filename}
            fill
            className="object-contain rounded-t-lg"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          />
          
          {/* Selection Checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleSelect(item.id)
              }}
              className={`h-6 w-6 p-0 border-2 ${
                isSelected 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                  : 'bg-white/90 hover:bg-white border-gray-300 hover:border-gray-400'
              }`}
            >
              {isSelected && <Check className="w-3 h-3" />}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-t-lg">
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  onShowDetails(item)
                }}
                className="h-8 w-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  onShowDetails(item)
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onCopyToClipboard(item.url)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadImage(item.url, item.filename)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(item.url, '_blank')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View External
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onUpdateItem(item.id, { favorite: !item.favorite })}
                  >
                    <Star className={`w-4 h-4 mr-2 ${item.favorite ? 'fill-yellow-400' : ''}`} />
                    {item.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onUpdateItem(item.id, { featured: !item.featured })}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${item.featured ? 'fill-red-400' : ''}`} />
                    {item.featured ? 'Remove Featured' : 'Set as Featured'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDeleteImage(item.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute bottom-1 left-1 flex gap-1">
            {item.featured && (
              <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                <Heart className="w-2 h-2" />
              </Badge>
            )}
            {item.favorite && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                <Star className="w-2 h-2" />
              </Badge>
            )}
          </div>
        </div>
        <div className="p-2">
          <p className="text-xs font-medium text-gray-900 dark:text-white truncate mb-1" title={item.title || item.filename}>
            {item.title || item.filename}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(item.size)}</span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {item.format?.toUpperCase() || 'IMG'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

MediaCard.displayName = 'MediaCard'


interface MediaManagementProps {
  onUploadSuccess?: (url: string) => void
}

export function MediaManagement({ onUploadSuccess }: MediaManagementProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showDetails, setShowDetails] = useState<MediaItem | null>(null)
  const [filterDate, setFilterDate] = useState<string>('all')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncService] = useState(() => CloudinarySyncService.getInstance())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteItem, setDeleteItem] = useState<MediaItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Performance optimizations
  const [visibleItems, setVisibleItems] = useState<number>(50) // Virtual scrolling
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cloudinary sync functions
  const syncWithCloudinary = async () => {
    setIsSyncing(true)
    try {
      // Fetch all media from Cloudinary (not just portfolios)
      const response = await getAllCloudinaryMedia()
      const cloudinaryMedia = response.resources.map(resource => convertCloudinaryResourceToMediaItem(resource))
      
      // Replace current media with all Cloudinary content
      setMediaItems(cloudinaryMedia)
      
      setLastSyncTime(new Date())
      // Keep user on same page and preserve their current state
      // Silently sync media items from Cloudinary
    } catch (error) {
      console.error('Error syncing with Cloudinary:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const searchCloudinaryMediaQuery = async (query: string) => {
    setIsSyncing(true)
    try {
      // Search all media from Cloudinary
      const response = await searchCloudinaryMedia(query)
      const cloudinaryMedia = response.resources.map(resource => convertCloudinaryResourceToMediaItem(resource))
      
      // Replace current media with search results
      setMediaItems(cloudinaryMedia)
      setLastSyncTime(new Date())
      // Keep user on same page and preserve their current state
      // Silently search media items from Cloudinary
    } catch (error) {
      console.error('Error searching Cloudinary:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Load media on component mount
  useEffect(() => {
    // Start with Cloudinary sync for all media
    syncWithCloudinary()
    
    // Enable auto-sync to keep all content updated
    syncService.startAutoSync(30, (newMedia) => {
      setMediaItems(prev => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = newMedia.filter(item => !existingIds.has(item.id))
        
        if (newItems.length > 0) {
          // Auto-sync: Silently added new media items
        }
        
        // Preserve user's current state during auto-sync
        return [...prev, ...newItems]
      })
      setLastSyncTime(new Date())
    })

    // Cleanup on unmount
    return () => {
      syncService.stopAutoSync()
    }
  }, [syncService])

  const handleImageUpload = (result: ImageUploadResponse) => {
    if (result.data?.url) {
      const newMediaItem: MediaItem = {
        id: `uploaded_${Date.now()}`,
        url: result.data.url,
        filename: result.data.original_filename || `uploaded_${Date.now()}.jpg`,
        size: result.data.bytes || 0,
        type: result.data.format || 'image/jpeg',
        uploadedAt: result.data.created_at || new Date().toISOString(),
        source: 'cloudinary',
        dimensions: { width: result.data.width || 400, height: result.data.height || 300 },
        title: result.data.original_filename?.replace(/\.[^/.]+$/, '') || 'Untitled',
        alt: '',
        caption: '',
        description: '',
        tags: [],
        folder: 'media',
        featured: false,
        favorite: false,
        archived: false,
        publicId: result.data.public_id,
        format: result.data.format,
        bytes: result.data.bytes,
        version: result.data.version
      }

      setMediaItems(prev => [newMediaItem, ...prev])
      onUploadSuccess?.(result.data.url)
      
      // Keep user on same page and state after upload
      toast.success('Image uploaded successfully!', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: document.documentElement.classList.contains('dark') 
            ? 'rgba(9, 222, 66,0.3)' 
            : '#09de42',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    }
  }

  // WordPress-like bulk operations
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedItems.length === 0) {
      toast.error('Please select items first')
      return
    }

    switch (action) {
      case 'delete':
        // Show confirmation dialog for bulk delete
        const selectedMediaItems = mediaItems.filter(item => selectedItems.includes(item.id))
        setDeleteItem(selectedMediaItems[0]) // Use first item for dialog display
        setShowDeleteDialog(true)
        break
      case 'favorite':
        setMediaItems(prev => prev.map(item => 
          selectedItems.includes(item.id) ? { ...item, favorite: true } : item
        ))
        // Keep selected items for potential further operations
        toast.success(`Added ${selectedItems.length} items to favorites`)
        break
      case 'archive':
        setMediaItems(prev => prev.map(item => 
          selectedItems.includes(item.id) ? { ...item, archived: true } : item
        ))
        // Keep selected items for potential further operations
        toast.success(`Archived ${selectedItems.length} items`)
        break
      case 'download':
        selectedItems.forEach(id => {
          const item = mediaItems.find(item => item.id === id)
          if (item) downloadImage(item.url, item.filename)
        })
        toast.success(`Downloaded ${selectedItems.length} items`)
        break
    }
  }, [selectedItems, mediaItems])

  // Handle actual deletion (both single and bulk)
  const handleConfirmDelete = async () => {
    if (!deleteItem && selectedItems.length === 0) return

    setIsDeleting(true)
    try {
      let itemsToDelete: MediaItem[]
      
      if (selectedItems.length > 0) {
        // Bulk delete
        itemsToDelete = mediaItems.filter(item => selectedItems.includes(item.id))
      } else {
        // Single delete
        itemsToDelete = [deleteItem!]
      }

      // Get public IDs for Cloudinary deletion
      const publicIds = itemsToDelete
        .filter(item => item.source === 'cloudinary' && item.publicId)
        .map(item => item.publicId!)

      if (publicIds.length > 0) {
        // Delete from Cloudinary
        const result = await deleteCloudinaryMedia(publicIds)
        
        if (result.success) {
          // Remove from local state
          const idsToRemove = itemsToDelete.map(item => item.id)
          setMediaItems(prev => prev.filter(item => !idsToRemove.includes(item.id)))
          
          if (selectedItems.length > 0) {
            setSelectedItems([])
            toast.success(`Deleted ${itemsToDelete.length} items from Cloudinary`)
          } else {
            toast.success(`Deleted "${deleteItem!.filename}" from Cloudinary`)
          }
        } else {
          // Cloudinary deletion failed, but still remove from local state
          console.warn('Cloudinary deletion failed, removing from local state only:', result.error)
          const idsToRemove = itemsToDelete.map(item => item.id)
          setMediaItems(prev => prev.filter(item => !idsToRemove.includes(item.id)))
          
          if (selectedItems.length > 0) {
            setSelectedItems([])
            toast.success(`Removed ${itemsToDelete.length} items from list (Cloudinary deletion failed)`)
          } else {
            toast.success(`Removed "${deleteItem!.filename}" from list (Cloudinary deletion failed)`)
          }
        }
      } else {
        // Fallback: just remove from local state
        const idsToRemove = itemsToDelete.map(item => item.id)
        setMediaItems(prev => prev.filter(item => !idsToRemove.includes(item.id)))
        
        if (selectedItems.length > 0) {
          setSelectedItems([])
          toast.success(`Removed ${itemsToDelete.length} items from list`)
        } else {
          toast.success(`Removed "${deleteItem!.filename}" from list`)
        }
      }

      setShowDeleteDialog(false)
      setDeleteItem(null)
      
      // Keep user on same page and state - no navigation changes
      
    } catch (error) {
      console.error('Error deleting media:', error)
      toast.error('Failed to delete media items')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }


  const clearSelection = () => {
    setSelectedItems([])
  }

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMediaItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard!')
  }

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteImage = (id: string) => {
    const item = mediaItems.find(item => item.id === id)
    if (item) {
      setDeleteItem(item)
      setShowDeleteDialog(true)
    }
  }

  // Debounced search term for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms debounce
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredMedia = useMemo(() => {
    // Pre-compile regex for better performance
    const searchRegex = debouncedSearchTerm ? new RegExp(debouncedSearchTerm.toLowerCase(), 'i') : null
    
    const filtered = mediaItems.filter(item => {
      // Optimize search with regex
      const matchesSearch = !searchRegex || 
        searchRegex.test(item.filename) ||
        searchRegex.test(item.title || '') ||
        searchRegex.test(item.alt || '') ||
        searchRegex.test(item.caption || '') ||
        item.tags?.some(tag => searchRegex.test(tag))
      
      const matchesFilter = item.source === 'cloudinary'
      const matchesFolder = true // Show all media now
      
      // Optimize date filtering
      let matchesDate = true
      if (filterDate !== 'all') {
        const itemDate = new Date(item.uploadedAt)
        const now = new Date()
        
        switch (filterDate) {
          case 'today':
            matchesDate = itemDate.toDateString() === now.toDateString()
            break
          case 'week':
            matchesDate = itemDate > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            matchesDate = itemDate > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
        }
      }
      
      return matchesSearch && matchesFilter && matchesFolder && matchesDate
    })
    
    // Sort the filtered results
    return filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.filename.localeCompare(b.filename)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'type':
          comparison = a.type.localeCompare(b.type)
          break
        case 'date':
        default:
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [mediaItems, debouncedSearchTerm, filterDate, sortBy, sortOrder])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Virtual scrolling for performance
  const displayedMedia = useMemo(() => {
    return filteredMedia.slice(0, visibleItems)
  }, [filteredMedia, visibleItems])

  // Load more items on scroll
  const handleScroll = useCallback(() => {
    if (isScrolling) return
    
    setIsScrolling(true)
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Load more when near bottom
      if (scrollTop + windowHeight >= documentHeight - 1000) {
        setVisibleItems(prev => Math.min(prev + 25, filteredMedia.length))
      }
      
      setIsScrolling(false)
    }, 100)
  }, [isScrolling, filteredMedia.length])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [handleScroll])

  return (
    <div className="space-y-6">
      {/* WordPress-like Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Media Library</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredMedia.length} of {mediaItems.length} items from Cloudinary
            {selectedItems.length > 0 && ` • ${selectedItems.length} selected`}
            {lastSyncTime && (
              <span className="ml-2 text-xs">
                • Last sync: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncWithCloudinary}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Media'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLoading(true)}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      {/* Sync Status Bar */}
      {isSyncing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Syncing with Cloudinary...
            </span>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('download')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('favorite')}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Favorite
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  Archive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              <X className="w-4 h-4 mr-1" />
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* WordPress-like Toolbar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search media files..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                // Auto-search Cloudinary when user types
                if (e.target.value.length > 2) {
                  searchCloudinaryMediaQuery(e.target.value)
                }
              }}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilterDate('all')}>All time</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDate('today')}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDate('week')}>This week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDate('month')}>This month</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SortAsc className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy('date')}>
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-2" /> : <SortDesc className="w-4 h-4 ml-2" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-2" /> : <SortDesc className="w-4 h-4 ml-2" />)}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>
                  Size {sortBy === 'size' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-2" /> : <SortDesc className="w-4 h-4 ml-2" />)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border border-gray-200 dark:border-gray-700 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none border-l-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Auto-sync Status */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className={`w-2 h-2 rounded-full ${syncService.isSyncing() ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>
                {syncService.isSyncing() ? 'Auto-sync ON (30s)' : 'Auto-sync OFF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No media found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No media matches your search criteria.' : 'Upload your first media file to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 justify-items-center">
          {displayedMedia.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onToggleSelect={toggleSelectItem}
              onShowDetails={setShowDetails}
              onUpdateItem={updateMediaItem}
              onDeleteImage={deleteImage}
              onCopyToClipboard={copyToClipboard}
              onDownloadImage={downloadImage}
            />
          ))}
          
          {/* Load More Button */}
          {visibleItems < filteredMedia.length && (
            <div className="col-span-full flex justify-center py-8">
              <Button
                onClick={() => setVisibleItems(prev => Math.min(prev + 25, filteredMedia.length))}
                variant="outline"
                className="px-8"
              >
                Load More ({filteredMedia.length - visibleItems} remaining)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedMedia.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 relative">
                          <Image
                            src={item.url}
                            alt={item.filename}
                            fill
                            className="object-cover rounded-lg"
                            loading="lazy"
                            sizes="64px"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={item.filename}>
                          {item.filename}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className="text-xs">
                          {item.source}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(item.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(item.url)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadImage(item.url, item.filename)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(item.url, '_blank')}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteImage(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media Files</DialogTitle>
            <DialogDescription>
              Upload images to your media library. You can select multiple files at once.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ImageUpload
              onUploadSuccess={(result) => {
                handleImageUpload(result)
                setShowUploadDialog(false)
              }}
              onUploadError={(error) => toast.error(error)}
              maxFiles={10}
              allowMultiple={true}
              className="mb-4"
              title="Upload Media Files"
              description="Drag and drop your images here, or click to browse"
              supportText="Supports: JPG, PNG, GIF, WebP, SVG (max 100MB each)"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Details Dialog */}
      {showDetails && (
        <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Media Details</DialogTitle>
              <DialogDescription>
                View and edit media information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative aspect-square max-h-96">
                  <Image
                    src={showDetails.url}
                    alt={showDetails.alt || showDetails.filename}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(showDetails.url)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage(showDetails.url, showDetails.filename)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(showDetails.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View External
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={showDetails.title || ''}
                    onChange={(e) => setShowDetails({...showDetails, title: e.target.value})}
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input
                    id="alt"
                    value={showDetails.alt || ''}
                    onChange={(e) => setShowDetails({...showDetails, alt: e.target.value})}
                    placeholder="Enter alt text"
                  />
                </div>
                <div>
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={showDetails.caption || ''}
                    onChange={(e) => setShowDetails({...showDetails, caption: e.target.value})}
                    placeholder="Enter caption"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={showDetails.description || ''}
                    onChange={(e) => setShowDetails({...showDetails, description: e.target.value})}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div>
                    <strong>File Size:</strong> {formatFileSize(showDetails.size)}
                  </div>
                  <div>
                    <strong>Dimensions:</strong> {showDetails.dimensions?.width}×{showDetails.dimensions?.height}
                  </div>
                  <div>
                    <strong>Format:</strong> {showDetails.format?.toUpperCase() || 'Unknown'}
                  </div>
                  <div>
                    <strong>Uploaded:</strong> {new Date(showDetails.uploadedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      updateMediaItem(showDetails.id, showDetails)
                      setShowDetails(null)
                      toast.success('Media updated successfully!')
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {selectedItems.length > 0 
                ? `Are you sure you want to delete ${selectedItems.length} selected media item${selectedItems.length > 1 ? 's' : ''}? This action will permanently remove them from Cloudinary and cannot be undone.`
                : `Are you sure you want to delete "${deleteItem?.filename}"? This action will permanently remove it from Cloudinary and cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeleteItem(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
