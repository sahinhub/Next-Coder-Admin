'use client'

import { useState, useEffect } from 'react'
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
import { X, Plus, Save } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.array(z.string()).min(1, 'At least one category is required'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  live_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumbnail: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  gallery: z.array(z.string()).optional(),
  client_testimonial: z.object({
    feedback: z.string().optional(),
    image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    name: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  date: z.string().optional(),
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
  const [categories, setCategories] = useState<string[]>((portfolio as Record<string, unknown>)?.category as string[] || [])
  const [newTech, setNewTech] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)

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
      category: (portfolio as Record<string, unknown>)?.category as string[] || [],
      technologies: (portfolio as Record<string, unknown>)?.technologies as string[] || [],
      features: (portfolio as Record<string, unknown>)?.features as string[] || [],
      live_url: (portfolio as Record<string, unknown>)?.live_url as string || '',
      thumbnail: (portfolio as Record<string, unknown>)?.thumbnail as string || '',
      gallery: (portfolio as Record<string, unknown>)?.gallery as string[] || [],
      client_testimonial: (portfolio as Record<string, unknown>)?.client_testimonial as object || {
        feedback: '',
        image: '',
        name: '',
        role: '',
      },
      link: (portfolio as Record<string, unknown>)?.link as string || '',
      date: (portfolio as Record<string, unknown>)?.date as string || new Date().toISOString(),
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
      form.setValue('category', updated)
      if (!category) {
        setNewCategory('')
      }
    }
  }

  const removeCategory = (category: string) => {
    const updated = categories.filter(c => c !== category)
    setCategories(updated)
    form.setValue('category', updated)
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
      console.log('Portfolio form submitted:', data)
      
      // Transform data to match MongoDB structure
      const portfolioData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        category: data.category,
        technologies: data.technologies,
        features: data.features,
        live_url: data.live_url || '',
        thumbnail: data.thumbnail || '',
        gallery: data.gallery || [],
        client_testimonial: data.client_testimonial || {
          feedback: '',
          image: '',
          name: '',
          role: '',
        },
        link: data.link || '',
        date: data.date || new Date().toISOString(),
      }
      
      let url = 'https://nextcoderapi.vercel.app/newPortfolio'
      let method = 'POST'
      
      if (isEdit && portfolio && '_id' in portfolio && portfolio._id) {
        url = `https://nextcoderapi.vercel.app/portfolio/update/${portfolio._id}`
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the project, features, and outcomes"
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="live_url"
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
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repo" {...field} />
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
                  name="client_testimonial.name"
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
                  name="client_testimonial.role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Role *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Owner" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Client Testimonial */}
              <div className=" ">
                <FormField
                  control={form.control}
                  name="client_testimonial.feedback"
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
