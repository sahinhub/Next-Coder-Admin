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
import { type ImageUploadResponse } from '@/lib/imageUpload'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { X, Save, Star, Calendar, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const formSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, 'Review must be at least 10 characters'),
  clientImage: z.string().optional(),
  featured: z.boolean(),
  date: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TestimonialFormProps {
  onClose: () => void
  testimonial?: FormData | (Record<string, unknown> & { _id?: string })
  isEdit?: boolean
  onSuccess?: () => void
}

export function TestimonialForm({ onClose, testimonial, isEdit = false, onSuccess }: TestimonialFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [clientImage, setClientImage] = useState<string>('')
  const { token } = useAuth()

  // Handle opening animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpening(false)
    }, 10) // Small delay to ensure the element is rendered
    return () => clearTimeout(timer)
  }, [])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCalendar) {
        const target = event.target as Element
        if (!target.closest('.calendar-container')) {
          setShowCalendar(false)
        }
      }
    }

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCalendar])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match the animation duration
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: (testimonial as Record<string, unknown>)?.name as string || '',
      rating: (testimonial as Record<string, unknown>)?.rating as number || 5,
      review: (testimonial as Record<string, unknown>)?.review as string || '',
      clientImage: (testimonial as Record<string, unknown>)?.clientImage as string || '',
      featured: (testimonial as Record<string, unknown>)?.featured as boolean || false,
      date: (testimonial as Record<string, unknown>)?.date as string || new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (isEdit && testimonial) {
      form.reset({
        name: (testimonial as Record<string, unknown>)?.name as string || '',
        rating: (testimonial as Record<string, unknown>)?.rating as number || 5,
        review: (testimonial as Record<string, unknown>)?.review as string || '',
        clientImage: (testimonial as Record<string, unknown>)?.clientImage as string || '',
        featured: (testimonial as Record<string, unknown>)?.featured as boolean || false,
        date: (testimonial as Record<string, unknown>)?.date as string || new Date().toISOString().split('T')[0],
      })
      setClientImage((testimonial as Record<string, unknown>)?.clientImage as string || '')
    }
  }, [isEdit, testimonial, form])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      console.log('Testimonial form submitted:', data)

      const url = isEdit
        ? `https://nextcoderapi.vercel.app/testimonial/update/${(testimonial as Record<string, unknown>)?._id}`
        : 'https://nextcoderapi.vercel.app/testimonials'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} testimonial`)
      }

      const result = await response.json()
      console.log(`Successfully ${isEdit ? 'updated' : 'created'} testimonial:`, result)

      toast.success(`Testimonial ${isEdit ? 'updated' : 'created'} successfully!`)

      // Success - refresh data and close form
      onSuccess?.()
      handleClose()
    } catch (error) {
      console.error('Error saving testimonial:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save testimonial. Please try again.'
      toast.error(errorMessage)
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

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    const selectedDate = form.getValues('date')
    return selectedDate === formatDate(date)
  }

  const handleDateSelect = (date: Date) => {
    form.setValue('date', formatDate(date))
    setShowCalendar(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1)
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1)
    }
    setCurrentMonth(newMonth)
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
                  <Label className="text-sm font-medium">Client Image</Label>
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

              {/* Rating and Featured */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Testimonial</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Show prominently on homepage
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial Date</FormLabel>
                    <div className="space-y-2">
                      <FormControl>
                        <div className="relative calendar-container">
                          <Input 
                            type="text"
                            value={field.value ? new Date(field.value).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            }) : ''}
                            readOnly
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="pl-10 pr-4 py-3 text-sm border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors cursor-pointer"
                            placeholder="Select a date"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </FormControl>
                      
                      {/* Custom Calendar */}
                      {showCalendar && (
                        <div className="calendar-container absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 w-80">
                          <div className="flex items-center justify-between mb-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMonth('prev')}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigateMonth('next')}
                              className="h-8 w-8 p-0"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Calendar Grid */}
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                              <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1">
                            {getDaysInMonth(currentMonth).map((day, index) => (
                              <div key={index} className="aspect-square">
                                {day ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDateSelect(day)}
                                    className={`w-full h-full text-sm rounded-md transition-colors ${
                                      isSelected(day)
                                        ? 'bg-purple-600 text-white'
                                        : isToday(day)
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}
                                  >
                                    {day.getDate()}
                                  </button>
                                ) : (
                                  <div className="w-full h-full" />
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const today = new Date()
                                  form.setValue('date', formatDate(today))
                                  setShowCalendar(false)
                                }}
                                className="text-xs h-6 px-2"
                              >
                                Today
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const yesterday = new Date()
                                  yesterday.setDate(yesterday.getDate() - 1)
                                  form.setValue('date', formatDate(yesterday))
                                  setShowCalendar(false)
                                }}
                                className="text-xs h-6 px-2"
                              >
                                Yesterday
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const lastWeek = new Date()
                                  lastWeek.setDate(lastWeek.getDate() - 7)
                                  form.setValue('date', formatDate(lastWeek))
                                  setShowCalendar(false)
                                }}
                                className="text-xs h-6 px-2"
                              >
                                Last Week
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Info className="h-4 w-4" />
                        <span>When was this testimonial received?</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </div>
  )
}