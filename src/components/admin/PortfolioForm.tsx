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
import { X, Plus, Save } from 'lucide-react'
import { type ImageUploadResponse } from '@/lib/imageUpload'
import { PORTFOLIO_ENDPOINTS } from '@/lib/config'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  liveUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  images: z.array(z.string()).optional(),
  client: z.object({
    name: z.string().optional(),
    designation: z.string().optional(),
    testimonial: z.string().optional(),
    image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  }).optional(),
  publishDate: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PortfolioFormProps {
  onClose: () => void
  portfolio?: FormData | (Record<string, unknown> & { _id?: string })
  isEdit?: boolean
  onSuccess?: () => void
}

export function PortfolioForm({ onClose, portfolio, isEdit = false, onSuccess }: PortfolioFormProps) {
  const [technologies, setTechnologies] = useState<string[]>((portfolio as Record<string, unknown>)?.technologies as string[] || [])
  const [features, setFeatures] = useState<string[]>((portfolio as Record<string, unknown>)?.features as string[] || [])
  const [categories, setCategories] = useState<string[]>((portfolio as Record<string, unknown>)?.categories as string[] || [])
  const [newTech, setNewTech] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [clientAvatar, setClientAvatar] = useState<string>('')

  // Handle opening animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpening(false)
    }, 10) // Small delay to ensure the element is rendered
    return () => clearTimeout(timer)
  }, [])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: (portfolio as Record<string, unknown>)?.title as string || '',
      slug: (portfolio as Record<string, unknown>)?.slug as string || '',
      description: (portfolio as Record<string, unknown>)?.description as string || '',
      categories: (portfolio as Record<string, unknown>)?.categories as string[] || [],
      technologies: (portfolio as Record<string, unknown>)?.technologies as string[] || [],
      features: (portfolio as Record<string, unknown>)?.features as string[] || [],
      liveUrl: (portfolio as Record<string, unknown>)?.liveUrl as string || '',
      thumbnail: (portfolio as Record<string, unknown>)?.thumbnail as string || '',
      images: (portfolio as Record<string, unknown>)?.images as string[] || [],
      client: (portfolio as Record<string, unknown>)?.client as object || {
        name: '',
        designation: '',
        testimonial: '',
        image: '',
      },
      publishDate: (portfolio as Record<string, unknown>)?.publishDate as string || new Date().toISOString(),
    },
  })

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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      
      // Transform data to match MongoDB structure with Cloudinary URLs
      const portfolioData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        categories: data.categories,
        technologies: data.technologies,
        features: data.features,
        liveUrl: data.liveUrl || '',
        // Cloudinary hosted URLs
        thumbnail: data.thumbnail || '', // Cloudinary URL for main project image
        images: data.images || [], // Array of Cloudinary URLs for project gallery
        client: {
          name: data.client?.name || '',
          designation: data.client?.designation || '',
          testimonial: data.client?.testimonial || '',
          image: data.client?.image || '', // Cloudinary URL for client avatar
        },
        publishDate: data.publishDate || new Date().toISOString(),
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
      
      let url = PORTFOLIO_ENDPOINTS.CREATE
      let method = 'POST'
      
      if (isEdit && portfolio && '_id' in portfolio && portfolio._id) {
        url = PORTFOLIO_ENDPOINTS.UPDATE(portfolio._id)
        method = 'PUT'
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portfolioData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} portfolio`)
      }

      const result = await response.json()
      console.log(`Successfully ${isEdit ? 'updated' : 'created'} portfolio:`, result)
      
      toast.success(`Portfolio ${isEdit ? 'updated' : 'created'} successfully!`)
      
      // Success - refresh data and close form
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Error saving portfolio:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save portfolio. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpening ? 'opacity-0' : isClosing ? 'opacity-0' : 'opacity-100'
        }`}>
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-3xl bg-white dark:bg-gray-900 shadow-xl transform transition-all duration-300 ease-in-out ${
        isOpening 
          ? 'translate-x-full opacity-0' 
          : isClosing 
            ? 'translate-x-full opacity-0' 
            : 'translate-x-0 opacity-100'
      }`}>
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{isEdit ? 'Edit Portfolio' : 'Add New Portfolio'}</CardTitle>
                <CardDescription>
                  {isEdit ? 'Update your portfolio project details' : 'Fill in the details to create a new portfolio project'}
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
                        <Input placeholder="e.g., Lakeside Lodges – Luxury Holiday Lodge Development" {...field} />
                      </FormControl>
                      <FormMessage />
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
                  <Label className="text-sm font-medium">Project Thumbnail</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload a main screenshot or thumbnail for this project
                  </p>
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
                  <Label className="text-sm font-medium">Project Gallery</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload multiple screenshots to showcase your project (up to 10 images)
                  </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          placeholder="Select publish date" 
                          {...field} 
                        />
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
                  <Label className="text-sm font-medium">Client Avatar</Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload a photo of the client for the testimonial
                  </p>
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
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
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
            </form>
          </Form>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
