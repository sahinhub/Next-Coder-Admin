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
  Video,
  Music,
  File,
  Grid,
  List,
  RefreshCw,
  Check,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { 
  getCloudinaryMediaByFolder,
  convertCloudinaryResourceToMediaItem,
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
} from '@/components/ui/dialog'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaItem | MediaItem[]) => void
  mediaType?: 'image' | 'video' | 'audio' | 'all'
  title?: string
  description?: string
  allowMultiple?: boolean
  maxSelections?: number
}

// Memoized Media Card Component for better performance
const MediaPickerCard = memo(({ 
  item, 
  isSelected, 
  onSelect,
  mediaType,
  allowMultiple = false
}: {
  item: MediaItem
  isSelected: boolean
  onSelect: (item: MediaItem) => void
  mediaType: 'image' | 'video' | 'audio' | 'all'
  allowMultiple?: boolean
}) => {
  const getFileIcon = () => {
    if (item.type?.startsWith('image/')) return <ImageIcon className="w-4 h-4" />
    if (item.type?.startsWith('video/')) return <Video className="w-4 h-4" />
    if (item.type?.startsWith('audio/')) return <Music className="w-4 h-4" />
    return <File className="w-4 h-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isCompatibleType = () => {
    if (mediaType === 'all') return true
    if (mediaType === 'image') return item.type?.startsWith('image/')
    if (mediaType === 'video') return item.type?.startsWith('video/')
    if (mediaType === 'audio') return item.type?.startsWith('audio/')
    return false
  }

  if (!isCompatibleType()) return null

  return (
    <Card 
      className={`group py-0 hover:shadow-lg transition-all duration-200 w-full cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={() => onSelect(item)}
    >
      <CardContent className="p-0 rounded-lg">
        <div className="relative h-24 bg-gray-100 dark:bg-gray-800 rounded-t-lg">
          {item.type?.startsWith('image/') ? (
            <Image
              src={item.url}
              alt={item.alt || item.filename}
              fill
              className="object-contain rounded-t-lg"
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {getFileIcon()}
            </div>
          )}
          
          {/* Selection Checkbox */}
          {allowMultiple && (
            <div className="absolute top-1 left-1 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onSelect(item)
                }}
                className={`h-5 w-5 p-0 border-2 ${
                  isSelected 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                    : 'bg-white/90 hover:bg-white border-gray-300 hover:border-gray-400'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </Button>
            </div>
          )}

          {/* File Type Badge */}
          <div className="absolute bottom-1 right-1">
            <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
              {getFileIcon()}
            </Badge>
          </div>
        </div>
        <div className="p-2">
          <p className="text-xs font-medium text-gray-900 dark:text-white truncate mb-1" title={item.title || item.filename}>
            {item.title || item.filename}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(item.size)}</span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {item.format?.toUpperCase() || 'FILE'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

MediaPickerCard.displayName = 'MediaPickerCard'

export function MediaPicker({ 
  isOpen, 
  onClose, 
  onSelect, 
  mediaType = 'all',
  title = 'Select Media',
  description = 'Choose a media file from your library',
  allowMultiple = false,
  maxSelections = 10
}: MediaPickerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([])
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterType, setFilterType] = useState<string>('all')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Performance optimizations
  const [visibleItems, setVisibleItems] = useState<number>(50)
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load media from Cloudinary
  const loadMedia = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getCloudinaryMediaByFolder('portfolios')
      const cloudinaryMedia = response.resources.map(resource => convertCloudinaryResourceToMediaItem(resource, 'portfolios'))
      setMediaItems(cloudinaryMedia)
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Error loading media:', error)
      toast.error('Failed to load media')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load media when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadMedia()
    }
  }, [isOpen, loadMedia])

  // Debounced search term for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredMedia = useMemo(() => {
    const searchRegex = debouncedSearchTerm ? new RegExp(debouncedSearchTerm.toLowerCase(), 'i') : null
    
    const filtered = mediaItems.filter(item => {
      // Search filter
      const matchesSearch = !searchRegex || 
        searchRegex.test(item.filename) ||
        searchRegex.test(item.title || '') ||
        searchRegex.test(item.alt || '') ||
        searchRegex.test(item.caption || '') ||
        item.tags?.some(tag => searchRegex.test(tag))
      
      // Type filter
      let matchesType = true
      if (filterType !== 'all') {
        if (filterType === 'image') matchesType = item.type?.startsWith('image/')
        else if (filterType === 'video') matchesType = item.type?.startsWith('video/')
        else if (filterType === 'audio') matchesType = item.type?.startsWith('audio/')
      }
      
      // Media type compatibility
      let matchesMediaType = true
      if (mediaType === 'image') matchesMediaType = item.type?.startsWith('image/')
      else if (mediaType === 'video') matchesMediaType = item.type?.startsWith('video/')
      else if (mediaType === 'audio') matchesMediaType = item.type?.startsWith('audio/')
      
      return matchesSearch && matchesType && matchesMediaType
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
          comparison = (a.type || '').localeCompare(b.type || '')
          break
        case 'date':
        default:
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [mediaItems, debouncedSearchTerm, filterType, mediaType, sortBy, sortOrder])

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

  const handleSelect = (item: MediaItem) => {
    if (allowMultiple) {
      // Multi-selection mode
      const isAlreadySelected = selectedItems.some(selected => selected.id === item.id)
      
      if (isAlreadySelected) {
        // Remove from selection
        const updated = selectedItems.filter(selected => selected.id !== item.id)
        setSelectedItems(updated)
      } else {
        // Add to selection (check max limit)
        if (selectedItems.length < maxSelections) {
          const updated = [...selectedItems, item]
          setSelectedItems(updated)
        } else {
          toast.error(`Maximum ${maxSelections} selections allowed`)
        }
      }
    } else {
      // Single selection mode - just select, don't close
      setSelectedItem(item)
    }
  }

  const handleConfirmSelection = () => {
    if (allowMultiple && selectedItems.length > 0) {
      onSelect(selectedItems)
      onClose()
    } else if (!allowMultiple && selectedItem) {
      onSelect(selectedItem)
      onClose()
    }
  }

  const handleClearSelection = () => {
    setSelectedItems([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Unknown size'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-[70vh]">
          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilterType('all')}>All Types</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('image')}>Images</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('video')}>Videos</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('audio')}>Audio</DropdownMenuItem>
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMedia}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Media Grid/List */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading media...</span>
              </div>
            ) : filteredMedia.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No media found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No media matches your search criteria.' : 'No media files available.'}
                  </p>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center p-1">
                {displayedMedia.map((item) => (
                  <MediaPickerCard
                    key={item.id}
                    item={item}
                    isSelected={allowMultiple ? selectedItems.some(selected => selected.id === item.id) : selectedItem?.id === item.id}
                    onSelect={handleSelect}
                    mediaType={mediaType}
                    allowMultiple={allowMultiple}
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
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {displayedMedia.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer" onClick={() => handleSelect(item)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-16 h-16 relative">
                                {item.type?.startsWith('image/') ? (
                                  <Image
                                    src={item.url}
                                    alt={item.filename}
                                    fill
                                    className="object-cover rounded-lg"
                                    loading="lazy"
                                    sizes="64px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    {item.type?.startsWith('video/') ? <Video className="w-6 h-6" /> : 
                                     item.type?.startsWith('audio/') ? <Music className="w-6 h-6" /> : 
                                     <File className="w-6 h-6" />}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs" title={item.filename}>
                                {item.filename}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className="text-xs">
                                {item.type?.split('/')[0] || 'Unknown'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(item.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.uploadedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSelect(item)
                                }}
                              >
                                Select
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredMedia.length} of {mediaItems.length} items
              {lastSyncTime && (
                <span className="ml-2">
                  • Last sync: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Selection Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {allowMultiple ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedItems.length} of {maxSelections} selected
                  </span>
                  {selectedItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSelection}
                    >
                      Clear Selection
                    </Button>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedItem ? `Selected: ${selectedItem.filename}` : 'No item selected'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={allowMultiple ? selectedItems.length === 0 : !selectedItem}
              >
                {allowMultiple 
                  ? `Select ${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''}`
                  : 'Select Item'
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
