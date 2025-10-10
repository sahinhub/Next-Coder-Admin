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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { MediaPicker } from '@/components/ui/MediaPicker'
import { type ImageUploadResponse } from '@/lib/imageUpload'
import { type MediaItem } from '@/lib/cloudinaryApi'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { X, Save, Star, Calendar, Info, Image as ImageIcon } from 'lucide-react'
import { testimonialsApi, type Testimonial } from '@/lib/api'

const formSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, 'Review must be at least 10 characters'),
  clientImage: z.string().optional(),
  date: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TestimonialFormProps {
  onClose: () => void
  testimonial?: FormData | (Record<string, unknown> & { _id?: string })
  isEdit?: boolean
  onSuccess?: (newItem?: Testimonial) => void
}

export function TestimonialForm({ onClose, testimonial, isEdit = false, onSuccess }: TestimonialFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)
  const [clientImage, setClientImage] = useState<string>('')
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaPickerType, setMediaPickerType] = useState<'image' | 'video' | 'audio' | 'all'>('image')

  // Handle opening animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpening(false)
    }, 10) // Small delay to ensure the element is rendered
    return () => clearTimeout(timer)
  }, [])


  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match the animation duration
  }

  const handleMediaPickerOpen = (type: 'image' | 'video' | 'audio' | 'all') => {
    setMediaPickerType(type)
    setShowMediaPicker(true)
  }

  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    const mediaArray = Array.isArray(media) ? media : [media]
    const selectedMedia = mediaArray[0]
    
    setClientImage(selectedMedia.url)
    form.setValue('clientImage', selectedMedia.url)
    setShowMediaPicker(false)
    toast.success(`Selected ${selectedMedia.filename} from media library`)
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: (testimonial as Record<string, unknown>)?.name as string || '',
      rating: (testimonial as Record<string, unknown>)?.rating as number || 5,
      review: (testimonial as Record<string, unknown>)?.review as string || '',
      clientImage: (testimonial as Record<string, unknown>)?.clientImage as string || '',
      date: (testimonial as Record<string, unknown>)?.date as string || new Date().toISOString().split('T')[0],
    },
  })

  // Auto-save draft functionality
  useEffect(() => {
    if (isEdit) return // Don't auto-save when editing existing testimonial

    const subscription = form.watch((data) => {
      // Debounce auto-save
      const timeoutId = setTimeout(() => {
        if (data.name || data.review) {
          const draftData = {
            ...data,
            clientImage,
            status: 'draft',
            lastSaved: new Date().toISOString()
          }
          localStorage.setItem('testimonial-draft', JSON.stringify(draftData))
        }
      }, 3000) // 3 second debounce

      return () => clearTimeout(timeoutId)
    })

    // Auto-save every 15 seconds
    const interval = setInterval(() => {
      if (!isEdit) {
        const formData = form.getValues()
        if (formData.name || formData.review) {
          const draftData = {
            ...formData,
            clientImage,
            status: 'draft',
            lastSaved: new Date().toISOString()
          }
          localStorage.setItem('testimonial-draft', JSON.stringify(draftData))
        }
      }
    }, 15000)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
    }
  }, [form, clientImage, isEdit])

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('testimonial-draft')
    if (savedDraft && !isEdit) {
      try {
        const draftData = JSON.parse(savedDraft)
        console.log('Loading testimonial draft:', draftData)
        
        form.reset({
          name: draftData.name || '',
          rating: draftData.rating || 5,
          review: draftData.review || '',
          clientImage: draftData.clientImage || '',
          date: draftData.date || new Date().toISOString().split('T')[0],
        })
        
        if (draftData.clientImage) {
          setClientImage(draftData.clientImage)
        }
      } catch (error) {
        console.error('Error loading testimonial draft:', error)
        localStorage.removeItem('testimonial-draft')
      }
    }
  }, [isEdit, form])

  useEffect(() => {
    if (isEdit && testimonial) {
      form.reset({
        name: (testimonial as Record<string, unknown>)?.name as string || '',
        rating: (testimonial as Record<string, unknown>)?.rating as number || 5,
        review: (testimonial as Record<string, unknown>)?.review as string || '',
        clientImage: (testimonial as Record<string, unknown>)?.clientImage as string || '',
        date: (testimonial as Record<string, unknown>)?.date as string || new Date().toISOString().split('T')[0],
      })
      setClientImage((testimonial as Record<string, unknown>)?.clientImage as string || '')
    }
  }, [isEdit, testimonial, form])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      console.log('Testimonial form submitted:', data)

      // Add status field and ensure all required fields are present
      const testimonialData = {
        ...data,
        clientImage: clientImage || '',
        status: 'published' as const,
        // Add optional fields that backend might expect
        platform: 'Direct', // Default platform since we removed the field
        featured: false, // Default featured status since we removed the field
      }

      let result
      
      if (isEdit && testimonial && '_id' in testimonial && testimonial._id) {
        result = await testimonialsApi.update(testimonial._id as string, testimonialData)
      } else {
        result = await testimonialsApi.create(testimonialData)
      }
      
      console.log(`Successfully ${isEdit ? 'updated' : 'created'} testimonial:`, result)

      // Clear draft on successful submission
      if (!isEdit) {
        localStorage.removeItem('testimonial-draft')
      }

      toast.success(`Testimonial ${isEdit ? 'updated' : 'created'} successfully!`, {
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

      // Success - refresh data and close form
      onSuccess?.(result as Testimonial)
      handleClose()
    } catch (error) {
      console.error('Error saving testimonial:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save testimonial. Please try again.'
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

  const renderStars = (rating: number, interactive = false) => {
    const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    
    return Array.from({ length: 5 }, (_, i) => (
      <div key={i} className="relative group">
        <Star
          className={`w-6 h-6 cursor-pointer transition-all duration-200 ${
            i < rating 
              ? 'text-yellow-400 fill-current hover:text-yellow-500' 
              : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={interactive ? () => form.setValue('rating', i + 1) : undefined}
        />
        {interactive && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {ratingLabels[i]} ({i + 1}/5)
          </div>
        )}
      </div>
    ))
  }


  const handleClientImageUpload = (result: ImageUploadResponse) => {
    if (result.data?.url) {
      setClientImage(result.data!.url)
      form.setValue('clientImage', result.data!.url)
      toast.success('Client image uploaded successfully!', {
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
                <CardTitle className="text-xl">{isEdit ? 'Edit Testimonial' : 'Add New Testimonial'}</CardTitle>
                <CardDescription>
                  {isEdit ? 'Update testimonial information' : 'Create a new testimonial entry'}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sarah Johnson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
              </div>

              {/* Review */}
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What the client said about your work..."
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Client Image Upload */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Client Image</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleMediaPickerOpen('image')}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Use from Media
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Upload a photo of the client for the testimonial
                  </p>
                  <ImageUpload
                    onUploadSuccess={handleClientImageUpload}
                    onUploadError={(error) => toast.error(error)}
                    maxFiles={1}
                    allowMultiple={false}
                    maxSize={1024 * 1024} // 1MB
                    className="mb-4"
                    title="Upload Client Image"
                    description="Drag and drop client image here, or click to browse"
                    supportText="Supports: JPG, PNG (max 1MB) for client image"
                  />
                  {clientImage && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Client Image:</p>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Image
                            src={clientImage}
                            alt="Client Image"
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-full border-2 border-gray-200 dark:border-gray-700"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                            onClick={() => {
                              setClientImage('')
                              form.setValue('clientImage', '')
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Image uploaded successfully</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">This will appear with the testimonial</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating *</FormLabel>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2 p-2 rounded-lg">
                          {renderStars(field.value, true)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              {field.value}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            out of 5
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Click on a star to set the rating
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Poor</span>
                        <span>Fair</span>
                        <span>Good</span>
                        <span>Very Good</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date - Auto-filled */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial Date</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text"
                            value={field.value ? new Date(field.value).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : ''}
                            readOnly
                            className="pl-10 pr-4 py-3 text-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
                            placeholder="Date will be set automatically"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </FormControl>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span>Date is automatically set to today when creating a new testimonial</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Draft Status */}
              {!isEdit && (form.getValues('name') || form.getValues('review')) && (
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Saving draft...</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className=" pt-4 mt-6">
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
                        {isEdit ? 'Update Testimonial' : 'Create Testimonial'}
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

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect as (media: MediaItem | MediaItem[]) => void}
        mediaType={mediaPickerType}
        title={`Select ${mediaPickerType === 'all' ? 'Media' : mediaPickerType.charAt(0).toUpperCase() + mediaPickerType.slice(1)}`}
        description={`Choose a ${mediaPickerType === 'all' ? 'media file' : mediaPickerType} from your Cloudinary library`}
      />
    </div>
  )
}