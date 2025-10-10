'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { MediaPicker } from '@/components/ui/MediaPicker'
import { X, Plus, Save, Image as ImageIcon } from 'lucide-react'
import { type ImageUploadResponse } from '@/lib/imageUpload'
import { projectsApi, type Project } from '@/lib/api'
import { type MediaItem } from '@/lib/cloudinaryApi'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  liveUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  images: z.array(z.string()).optional(),
  client: z.object({
    name: z.string().optional(),
    designation: z.string().optional(),
    testimonial: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
}).refine((data) => {
  // Additional validation: ensure at least one image is provided
  if (!data.thumbnail && (!data.images || data.images.length === 0)) {
    return false
  }
  return true
}, {
  message: "At least one image (thumbnail or gallery) is required",
  path: ["thumbnail"]
})

type FormData = z.infer<typeof formSchema>

// Type for portfolio data that can come from API with various field name formats
interface PortfolioData {
  _id?: string
  title?: string
  slug?: string
  description?: string
  categories?: string[]
  category?: string[] // Backward compatibility
  technologies?: string[]
  features?: string[]
  liveUrl?: string
  live_url?: string // Backward compatibility
  thumbnail?: string
  images?: string[]
  gallery?: string[] // Backward compatibility
  client?: {
    name?: string
    designation?: string
    testimonial?: string
    image?: string
  }
  publishDate?: string
  status?: 'draft' | 'published'
  createdAt?: string
  updatedAt?: string
}

interface PortfolioFormProps {
  onClose: () => void
  portfolio?: PortfolioData
  isEdit?: boolean
  onSuccess?: (newItem?: Project) => void
}

export function PortfolioForm({ onClose, portfolio, isEdit = false, onSuccess }: PortfolioFormProps) {
  const [technologies, setTechnologies] = useState<string[]>(portfolio?.technologies || [])
  const [features, setFeatures] = useState<string[]>(portfolio?.features || [])
  const [categories, setCategories] = useState<string[]>(() => {
    // Handle both 'categories' and 'category' fields for backward compatibility
    const categories = portfolio?.categories || portfolio?.category || []
    return Array.isArray(categories) ? categories : [categories]
  })
  const [newTech, setNewTech] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)
  const [clickOutsideEnabled, setClickOutsideEnabled] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(() => {
    // Initialize with thumbnail if available
    return portfolio?.thumbnail ? [portfolio.thumbnail] : []
  })
  const [galleryImages, setGalleryImages] = useState<string[]>(() => {
    // Handle both 'images' and 'gallery' fields for backward compatibility
    const images = portfolio?.images || portfolio?.gallery || []
    return Array.isArray(images) ? images : [images]
  })
  const [clientAvatar, setClientAvatar] = useState<string>(() => {
    // Initialize with client image if available
    return portfolio?.client?.image || ''
  })
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaPickerType, setMediaPickerType] = useState<'image' | 'video' | 'audio' | 'all'>('image')
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'featured' | 'gallery' | 'client'>('featured')
  const [hasSelectedThumbnail, setHasSelectedThumbnail] = useState(() => {
    return !!portfolio?.thumbnail
  })
  const [hasSelectedGallery, setHasSelectedGallery] = useState(() => {
    const images = portfolio?.images || portfolio?.gallery || []
    return Array.isArray(images) ? images.length > 0 : !!images
  })
  const [hasSelectedClientAvatar, setHasSelectedClientAvatar] = useState(() => {
    return !!portfolio?.client?.image
  })
  const [isDraft, setIsDraft] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: portfolio?.title || '',
      slug: portfolio?.slug || '',
      description: portfolio?.description || '',
      categories: (() => {
        // Handle both 'categories' and 'category' fields for backward compatibility
        const categories = portfolio?.categories || portfolio?.category || []
        return Array.isArray(categories) ? categories : [categories]
      })(),
      technologies: portfolio?.technologies || [],
      features: portfolio?.features || [],
      liveUrl: (() => {
        // Handle both 'liveUrl' and 'live_url' fields for backward compatibility
        return portfolio?.liveUrl || portfolio?.live_url || ''
      })(),
      thumbnail: portfolio?.thumbnail || '',
      images: (() => {
        // Handle both 'images' and 'gallery' fields for backward compatibility
        const images = portfolio?.images || portfolio?.gallery || []
        return Array.isArray(images) ? images : [images]
      })(),
      client: portfolio?.client || {
        name: '',
        designation: '',
        testimonial: '',
        image: '',
      },
    },
  })

  // Handle opening animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpening(false)
      setClickOutsideEnabled(true) // Enable click outside after animation
    }, 300) // Wait for animation to complete
    return () => clearTimeout(timer)
  }, [])

  // Auto-save draft functionality
  useEffect(() => {
    const saveDraft = async () => {
      setIsSaving(true)
      const formData = form.getValues()
      const draftData = {
        ...formData,
        uploadedImages,
        galleryImages,
        clientAvatar,
        isDraft: true,
        status: 'draft',
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem('portfolio-draft', JSON.stringify(draftData))
      setIsDraft(true)
      
      // Show saving indicator briefly
      setTimeout(() => setIsSaving(false), 1000)
    }

    // Auto-save every 15 seconds
    const interval = setInterval(saveDraft, 15000)
    
    // Save on form changes (debounced)
    const subscription = form.watch(() => {
      const timeoutId = setTimeout(saveDraft, 3000) // Debounce for 3 seconds
      return () => clearTimeout(timeoutId)
    })

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [form, uploadedImages, galleryImages, clientAvatar])

  // Load existing portfolio data when editing
  useEffect(() => {
    if (isEdit && portfolio) {
      console.log('Loading portfolio data for editing:', portfolio)
      
      // Handle both 'categories' and 'category' fields for backward compatibility
      const categories = portfolio.categories || portfolio.category || []
      const categoryArray = Array.isArray(categories) ? categories : [categories]
      
      // Handle both 'images' and 'gallery' fields for backward compatibility
      const images = portfolio.images || portfolio.gallery || []
      const imageArray = Array.isArray(images) ? images : [images]
      
      // Handle both 'liveUrl' and 'live_url' fields for backward compatibility
      const liveUrl = portfolio.liveUrl || portfolio.live_url || ''
      
      // Load form data
      form.reset({
        title: portfolio.title || '',
        slug: portfolio.slug || '',
        description: portfolio.description || '',
        categories: categoryArray,
        technologies: portfolio.technologies || [],
        features: portfolio.features || [],
        liveUrl: liveUrl,
        thumbnail: portfolio.thumbnail || '',
        images: imageArray,
        client: portfolio.client || {
          name: '',
          designation: '',
          testimonial: '',
          image: '',
        },
      })
      
      // Load state data
      setTechnologies(portfolio.technologies || [])
      setFeatures(portfolio.features || [])
      setCategories(categoryArray)
      
      // Load images
      if (portfolio.thumbnail) {
        setUploadedImages([portfolio.thumbnail])
        setHasSelectedThumbnail(true)
      }
      
      if (imageArray.length > 0) {
        setGalleryImages(imageArray)
        setHasSelectedGallery(true)
      }
      
      if (portfolio.client?.image) {
        setClientAvatar(portfolio.client.image)
        setHasSelectedClientAvatar(true)
      }
    }
  }, [isEdit, portfolio, form])

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('portfolio-draft')
    if (savedDraft && !isEdit) {
      try {
        const draftData = JSON.parse(savedDraft)
        if (draftData.isDraft) {
          // Restore form data
          form.reset(draftData)
          setUploadedImages(draftData.uploadedImages || [])
          setGalleryImages(draftData.galleryImages || [])
          setClientAvatar(draftData.clientAvatar || '')
          setTechnologies(draftData.technologies || [])
          setFeatures(draftData.features || [])
          setCategories(draftData.categories || [])
          setIsDraft(true)
          // Draft restored from previous session
        }
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [form, isEdit])

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      const updated = [...technologies, newTech.trim()]
      setTechnologies(updated)
      form.setValue('technologies', updated)
      setNewTech('')
    }
  }

  const removeTechnology = (tech: string) => {
    const updated = technologies.filter(t => t !== tech)
    setTechnologies(updated)
    form.setValue('technologies', updated)
  }

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updated = [...features, newFeature.trim()]
      setFeatures(updated)
      form.setValue('features', updated)
      setNewFeature('')
    }
  }

  const removeFeature = (feature: string) => {
    const updated = features.filter(f => f !== feature)
    setFeatures(updated)
    form.setValue('features', updated)
  }

  const addCategory = (category?: string) => {
    const categoryToAdd = category || newCategory.trim()
    if (categoryToAdd && !categories.includes(categoryToAdd)) {
      const updated = [...categories, categoryToAdd]
      setCategories(updated)
      form.setValue('categories', updated)
      if (!category) {
        setNewCategory('')
      }
    }
  }

  const removeCategory = (category: string) => {
    const updated = categories.filter(c => c !== category)
    setCategories(updated)
    form.setValue('categories', updated)
  }

  const handleImageUpload = (result: ImageUploadResponse) => {
    if (result.data?.url) {
      setUploadedImages(prev => [...prev, result.data!.url])
      form.setValue('thumbnail', result.data!.url)
      setHasSelectedThumbnail(true)
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

  const handleGalleryUpload = (result: ImageUploadResponse) => {
    if (result.data?.url) {
      setGalleryImages(prev => [...prev, result.data!.url])
      const currentGallery = form.getValues('images') || []
      form.setValue('images', [...currentGallery, result.data!.url])
      setHasSelectedGallery(true)
      toast.success('Gallery image uploaded successfully!', {
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

  const handleClientAvatarUpload = (result: ImageUploadResponse) => {
    if (result.data?.url) {
      setClientAvatar(result.data!.url)
      form.setValue('client.image', result.data!.url)
      setHasSelectedClientAvatar(true)
      toast.success('Client avatar uploaded successfully!', {
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

  const removeGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index)
    setGalleryImages(updated)
    form.setValue('images', updated)
  }


  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match the animation duration
  }

  const handleMediaPickerOpen = (type: 'image' | 'video' | 'audio' | 'all', target: 'featured' | 'gallery' | 'client') => {
    setMediaPickerType(type)
    setMediaPickerTarget(target)
    setShowMediaPicker(true)
  }

  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    const mediaArray = Array.isArray(media) ? media : [media]
    
    if (mediaPickerTarget === 'featured') {
      const selectedMedia = mediaArray[0]
      setUploadedImages([selectedMedia.url])
      form.setValue('thumbnail', selectedMedia.url)
      setHasSelectedThumbnail(true)
      toast.success(`Selected ${selectedMedia.filename} from media library`)
    } else if (mediaPickerTarget === 'gallery') {
      const newUrls = mediaArray.map(m => m.url)
      setGalleryImages(prev => [...prev, ...newUrls])
      const currentImages = form.getValues('images') || []
      form.setValue('images', [...currentImages, ...newUrls])
      setHasSelectedGallery(true)
      toast.success(`Selected ${mediaArray.length} image${mediaArray.length > 1 ? 's' : ''} from media library`)
    } else if (mediaPickerTarget === 'client') {
      const selectedMedia = mediaArray[0]
      setClientAvatar(selectedMedia.url)
      const currentClient = form.getValues('client') || { name: '', designation: '', testimonial: '', image: '' }
      form.setValue('client', { ...currentClient, image: selectedMedia.url })
      setHasSelectedClientAvatar(true)
      toast.success(`Selected ${selectedMedia.filename} from media library`)
    }
    setShowMediaPicker(false)
  }

  const onSubmit = async (data: FormData) => {
    console.log('🚀 Form submission started with data:', data)
    console.log('📊 Form validation state:', form.formState)
    console.log('❌ Form errors:', form.formState.errors)
    
    // Check if form is valid before proceeding
    if (!form.formState.isValid) {
      console.log('❌ Form is not valid, triggering validation')
      form.trigger() // Trigger validation to show errors
      return
    }
    
    setIsLoading(true)
    try {
      
      // Transform data to match deployed backend validation schema
      const portfolioData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: data.description,
        category: data.categories, // Backend validation expects 'category'
        technologies: data.technologies,
        features: data.features,
        live_url: data.liveUrl || '', // Backend validation expects 'live_url'
        // Cloudinary hosted URLs
        thumbnail: data.thumbnail || '', // Cloudinary URL for main project image
        gallery: data.images || [], // Backend validation expects 'gallery'
        client: {
          name: data.client?.name || '',
          designation: data.client?.designation || '',
          testimonial: data.client?.testimonial || '',
          image: data.client?.image || '', // Cloudinary URL for client avatar
        },
        publishDate: new Date().toISOString(),
        status: 'published', // Default status for new portfolios
        // Additional metadata for Cloudinary images
        imageMetadata: {
          thumbnail: data.thumbnail ? {
            url: data.thumbnail,
            source: 'cloudinary',
            uploadedAt: new Date().toISOString()
          } : null,
          images: (data.images || []).map((url: string) => ({
            url,
            source: 'cloudinary',
            uploadedAt: new Date().toISOString()
          })),
          clientAvatar: data.client?.image ? {
            url: data.client.image,
            source: 'cloudinary',
            uploadedAt: new Date().toISOString()
          } : null
        }
      }
      
      let result
      if (isEdit && portfolio && '_id' in portfolio && portfolio._id) {
        result = await projectsApi.update(portfolio._id, portfolioData)
        console.log('✅ Portfolio updated successfully:', result)
      } else {
        result = await projectsApi.create(portfolioData)
        console.log('✅ Portfolio created successfully:', result)
      }
      
      toast.success(`Portfolio ${isEdit ? 'updated' : 'created'} successfully!`, {
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
      
      // Clear draft on successful submission
      localStorage.removeItem('portfolio-draft')
      setIsDraft(false)
      
      // Success - refresh data and close form
      onSuccess?.(result as Project)
      handleClose()
    } catch (error) {
      console.error('Error saving portfolio:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save portfolio. Please try again.'
      toast.error(errorMessage, {
        duration: 5000,
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpening ? 'opacity-0' : isClosing ? 'opacity-0' : 'opacity-100'
        }`}>
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={clickOutsideEnabled ? handleClose : undefined}></div>
      
      {/* Sidebar */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-3xl bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out ${
          isOpening 
            ? 'translate-x-full opacity-0' 
            : isClosing 
              ? 'translate-x-full opacity-0' 
              : 'translate-x-0 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {isEdit ? 'Edit Portfolio' : 'Add New Portfolio'}
                  {isDraft && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                      Draft
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isEdit ? 'Update your portfolio project details' : 'Fill in the details to create a new portfolio project'}
                  {isDraft && (
                    <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Auto-saved as draft
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Lakeside Lodges – Luxury Holiday Lodge Development" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            // Auto-generate slug from title
                            const slug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                            form.setValue('slug', slug)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., lakeside-lodges-luxury-holiday-lodge-development" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        This will be used in the project URL. Auto-generated from title.
                      </p>
                    </FormItem>
                  )}
                />
                
                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium">Categories *</Label>
                  
                  {/* Predefined Categories */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Select from predefined categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Agency', 'LMS', 'Membership', 'News', 'SEO', 'UI/UX Design', 'Web Development'].map((category) => (
                        <Button
                          key={category}
                          type="button"
                          variant={categories.includes(category) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (categories.includes(category)) {
                              removeCategory(category)
                            } else {
                              addCategory(category)
                            }
                          }}
                          className="text-xs h-8"
                        >
                          {category}
                          {categories.includes(category) && <X className="h-3 w-3 ml-1" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Custom Category Input */}
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Or add a custom category:</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={() => addCategory()} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Selected Categories Display */}
                  {categories.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Selected categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Badge key={category} variant="secondary" className="flex items-center gap-1">
                            {category}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => removeCategory(category)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {categories.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">At least one category is required</p>
                  )}
                </div>
              </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of the project (1-2 sentences)"
                        className="h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Image Upload Section */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Project Thumbnail</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMediaPickerOpen('image', 'featured')}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Use from Media
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload a main screenshot or thumbnail for this project
                  </p>
                  {!hasSelectedThumbnail && (
                    <ImageUpload
                      onUploadSuccess={handleImageUpload}
                      onUploadError={(error) => toast.error(error)}
                      maxFiles={1}
                      allowMultiple={false}
                      maxSize={4 * 1024 * 1024} // 4MB
                      className="mb-4"
                      title="Upload Project Thumbnail"
                      description="Drag and drop your thumbnail here, or click to browse"
                      supportText="Supports: JPG, PNG, WebP (max 4MB) for thumbnail"
                    />
                  )}
                  {uploadedImages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Uploaded Thumbnail:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={url}
                              alt="Thumbnail"
                              width={96}
                              height={96}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setUploadedImages(prev => prev.filter((_, i) => i !== index))
                                  form.setValue('thumbnail', '')
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Project Gallery</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMediaPickerOpen('image', 'gallery')}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Use from Media
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload multiple screenshots to showcase your project (up to 10 images)
                  </p>
                  {!hasSelectedGallery && (
                    <ImageUpload
                      onUploadSuccess={handleGalleryUpload}
                      onUploadError={(error) => toast.error(error)}
                      maxFiles={10}
                      allowMultiple={true}
                      className="mb-4"
                      title="Upload Project Gallery Images"
                      description="Drag and drop your project gallery image here, or click to browse"
                      supportText="Supports: JPG, PNG, GIF, WebP (max 32MB) for gallery"
                    />
                  )}
                  {galleryImages.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Gallery Images ({galleryImages.length}/10):
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGalleryImages([])
                            form.setValue('images', [])
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              width={96}
                              height={96}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeGalleryImage(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    // Move image to front
                                    const newOrder = [url, ...galleryImages.filter((_, i) => i !== index)]
                                    setGalleryImages(newOrder)
                                    form.setValue('images', newOrder)
                                  }}
                                >
                                  ↑
                                </Button>
                              </div>
                            </div>
                            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      {galleryImages.length < 10 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          You can upload {10 - galleryImages.length} more images
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Project URLs */}
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="liveUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Live URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Technologies */}
              <div>
                <Label className="text-sm font-medium">Technologies Used *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add technology (e.g., React, Node.js)"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  />
                  <Button type="button" onClick={addTechnology} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeTechnology(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div>
                <Label className="text-sm font-medium">Key Features *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add feature (e.g., Interactive lodge location selector)"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                      {feature}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeFeature(feature)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="client.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sarah" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="client.designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Designation *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Business Owner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Client Testimonial */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="client.testimonial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Testimonial</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="What the client said about the project"
                          className="h-20 "
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Client Avatar Upload */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Client Avatar</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMediaPickerOpen('image', 'client')}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Use from Media
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload a photo of the client for the testimonial
                  </p>
                  {!hasSelectedClientAvatar && (
                    <ImageUpload
                      onUploadSuccess={handleClientAvatarUpload}
                      onUploadError={(error) => toast.error(error)}
                      maxFiles={1}
                      allowMultiple={false}
                      maxSize={1024 * 1024} // 1MB
                      className="mb-4"
                      title="Upload Client Avatar"
                      description="Drag and drop Client Avatar here, or click to browse"
                      supportText="Supports: JPG, PNG (max 1MB) for avatar"
                    />
                  )}
                  {clientAvatar && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Client Avatar:</p>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Image
                            src={clientAvatar}
                            alt="Client Avatar"
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => {
                              setClientAvatar('')
                              form.setValue('client.image', '')
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Avatar uploaded successfully</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">This will appear with the testimonial</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className=" bottom-0 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {isDraft && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
                        {isSaving ? 'Saving draft...' : 'Auto-saved as draft'}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      onClick={() => {
                        console.log('🔘 Submit button clicked')
                        console.log('📝 Form values:', form.getValues())
                        console.log('✅ Form is valid:', form.formState.isValid)
                        console.log('❌ Form errors:', form.formState.errors)
                      }}
                    >
                      {isLoading ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEdit ? 'Update Portfolio' : 'Create Portfolio'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
        </Card>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        mediaType={mediaPickerType}
        title={`Select ${mediaPickerType === 'all' ? 'Media' : mediaPickerType.charAt(0).toUpperCase() + mediaPickerType.slice(1)}`}
        description={`Choose a ${mediaPickerType === 'all' ? 'media file' : mediaPickerType} from your Cloudinary library`}
        allowMultiple={mediaPickerTarget === 'gallery'}
        maxSelections={mediaPickerTarget === 'gallery' ? 10 : 1}
      />
    </div>
  )
}
