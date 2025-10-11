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
import { X, Save, Plus, Image as ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MediaPicker } from '@/components/ui/MediaPicker'
import { DatePicker } from '@/components/ui/date-picker'
import { Calendar } from 'lucide-react'
import { type MediaItem } from '@/lib/cloudinaryApi'
import { careersApi, type Career } from '@/lib/api'
import { showSuccessToast } from '@/lib/utils'

const formSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  experienceRequired: z.string().min(1, 'Experience required is needed'),
  employmentType: z.string().min(1, 'Employment type is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  image: z.string().optional(),
  postedDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'closed']),
})

type FormData = z.infer<typeof formSchema>

interface CareerFormProps {
  onClose: () => void
  job?: FormData | (Record<string, unknown> & { _id?: string })
  isEdit?: boolean
  onSuccess?: (newItem?: Career) => void
}

export function CareerForm({ onClose, job, isEdit = false, onSuccess }: CareerFormProps) {
  const [responsibilities, setResponsibilities] = useState<string[]>((job as Record<string, unknown>)?.responsibilities as string[] || [])
  const [skills, setSkills] = useState<string[]>((job as Record<string, unknown>)?.skills as string[] || [])
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isOpening, setIsOpening] = useState(true)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaPickerType, setMediaPickerType] = useState<'image' | 'video' | 'audio' | 'all'>('image')
  const [isDraft, setIsDraft] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleMediaSelect = (media: MediaItem) => {
    form.setValue('image', media.url)
    setShowMediaPicker(false)
    showSuccessToast(`Selected ${media.filename} from media library`)
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: (job as Record<string, unknown>)?.title as string || '',
      department: (job as Record<string, unknown>)?.department as string || '',
      location: (job as Record<string, unknown>)?.location as string || '',
      experienceRequired: (job as Record<string, unknown>)?.experienceRequired as string || '',
      employmentType: (job as Record<string, unknown>)?.employmentType as string || 'Full-time',
      description: (job as Record<string, unknown>)?.description as string || '',
      responsibilities: (job as Record<string, unknown>)?.responsibilities as string[] || [],
      skills: (job as Record<string, unknown>)?.skills as string[] || [],
      image: (job as Record<string, unknown>)?.image as string || '',
      postedDate: (job as Record<string, unknown>)?.postedDate as string || new Date().toISOString().split('T')[0],
      applicationDeadline: (job as Record<string, unknown>)?.applicationDeadline as string || '',
      status: (job as Record<string, unknown>)?.status as 'active' | 'paused' | 'closed' || 'active',
    },
  })

  // Auto-save draft functionality
  useEffect(() => {
    const saveDraft = async () => {
      setIsSaving(true)
      const formData = form.getValues()
      const draftData = {
        ...formData,
        responsibilities,
        skills,
        isDraft: true,
        status: 'draft',
        lastSaved: new Date().toISOString()
      }
      localStorage.setItem('career-draft', JSON.stringify(draftData))
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
  }, [form, responsibilities, skills])

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('career-draft')
    if (savedDraft && !isEdit) {
      try {
        const draftData = JSON.parse(savedDraft)
        if (draftData.isDraft) {
          // Restore form data
          form.reset({
            title: draftData.title || '',
            department: draftData.department || '',
            location: draftData.location || '',
            experienceRequired: draftData.experienceRequired || '',
            employmentType: draftData.employmentType || 'Full-time',
            description: draftData.description || '',
            responsibilities: draftData.responsibilities || [],
            skills: draftData.skills || [],
            image: draftData.image || '',
            postedDate: draftData.postedDate || new Date().toISOString().split('T')[0],
            applicationDeadline: draftData.applicationDeadline || '',
            status: draftData.status || 'active',
          })
          
          // Load state arrays
          setResponsibilities(draftData.responsibilities || [])
          setSkills(draftData.skills || [])
          setIsDraft(true)
          // Draft restored from previous session
        }
      } catch (error) {
        console.error('Error loading career draft:', error)
        localStorage.removeItem('career-draft')
      }
    }
  }, [isEdit, form])

  const addItem = (type: 'responsibility' | 'skill') => {
    const newItem = type === 'responsibility' ? newResponsibility : newSkill

    if (newItem.trim()) {
      const currentArray = type === 'responsibility' ? responsibilities : skills

      if (!currentArray.includes(newItem.trim())) {
        const updated = [...currentArray, newItem.trim()]
        
        if (type === 'responsibility') {
          setResponsibilities(updated)
          form.setValue('responsibilities', updated)
          setNewResponsibility('')
        } else {
          setSkills(updated)
          form.setValue('skills', updated)
          setNewSkill('')
        }
      }
    }
  }

  const removeItem = (type: 'responsibility' | 'skill', item: string) => {
    const currentArray = type === 'responsibility' ? responsibilities : skills

    const updated = currentArray.filter(i => i !== item)
    
    if (type === 'responsibility') {
      setResponsibilities(updated)
      form.setValue('responsibilities', updated)
    } else {
      setSkills(updated)
      form.setValue('skills', updated)
    }
  }

  const onSubmit = async (data: FormData) => {
    
    setIsLoading(true)
    try {
      // Prepare data for MongoDB structure
      const careerData = {
        title: data.title,
        department: data.department,
        location: data.location,
        experienceRequired: data.experienceRequired,
        employmentType: data.employmentType,
        description: data.description,
        responsibilities: data.responsibilities,
        skills: data.skills,
        postedDate: data.postedDate || new Date().toISOString().split('T')[0],
        applicationDeadline: data.applicationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: data.status as 'draft' | 'active' | 'paused' | 'closed', // Use form status value
      }


      let result
      
      if (isEdit && job && '_id' in job && job._id) {
        result = await careersApi.update(job._id as string, careerData)
      } else {
        result = await careersApi.create(careerData)
      }
      
      
      // Clear draft on successful submission
      if (!isEdit) {
        localStorage.removeItem('career-draft')
      }
      
      showSuccessToast(`Job posting ${isEdit ? 'updated' : 'created'} successfully!`)
      
      // Success - refresh data and close form
      onSuccess?.(result as Career)
      onClose()
    } catch (error) {
      console.error('Error saving career:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save job posting. Please try again.'
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
                <CardTitle className="text-xl flex items-center gap-2">
                  {isEdit ? 'Edit Job Posting' : 'Add New Job Posting'}
                  {isDraft && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                      Draft
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {isEdit ? 'Update job posting information' : 'Create a new job posting'}
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
            <form onSubmit={(e) => {
              form.handleSubmit(onSubmit)(e)
            }} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Senior Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Engineering, Design, Marketing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <FormControl>
                        <Input className='w-full' placeholder="e.g., New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField 
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className=''>
                          <SelectItem value="Full-time">Full Time</SelectItem>
                          <SelectItem value="Part-time">Part Time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experienceRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Entry Level (0-2 years)">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="Mid Level (3-5 years)">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="Senior Level (6-10 years)">Senior Level (6-10 years)</SelectItem>
                          <SelectItem value="Lead/Principal (10+ years)">Lead/Principal (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Application Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="applicationDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value ? new Date(field.value) : undefined}
                          onChange={(date) => field.onChange(date?.toISOString().split('T')[0])}
                          placeholder="Select deadline"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posted Date</FormLabel>
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
                            disabled
                            className="pl-10 pr-4 py-3 text-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                            placeholder="Date will be set automatically"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Date is automatically set to current date when creating a new job posting
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Job Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the role, company culture, and what makes this position exciting..."
                        className="h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Job Image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-3">
                      <FormLabel>Job Image</FormLabel>
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
                    <FormControl>
                      <Input 
                        placeholder="Enter image URL or use media picker"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Preview:</p>
                        <div className="relative w-32 h-20 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <Image
                            src={field.value}
                            alt="Job preview"
                            fill
                            className="object-cover"
                            onError={() => {
                              // Handle error if needed
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Responsibilities */}
              <div>
                <Label className="text-sm font-medium">Responsibilities *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add responsibility"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('responsibility'))}
                  />
                  <Button type="button" onClick={() => addItem('responsibility')} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {responsibilities.map((resp) => (
                    <div key={resp} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {resp}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('responsibility', resp)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-sm font-medium">Required Skills *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('skill'))}
                  />
                  <Button type="button" onClick={() => addItem('skill')} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {skill}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeItem('skill', skill)}
                      />
                    </div>
                  ))}
                </div>
              </div>


              {/* Status and Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              {/* Action Buttons */}
              <div className=" pt-4 mt-6">
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
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEdit ? 'Update Job Posting' : 'Create Job Posting'}
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
        onSelect={handleMediaSelect as (media: MediaItem | MediaItem[]) => void}
        mediaType={mediaPickerType}
        title={`Select ${mediaPickerType === 'all' ? 'Media' : mediaPickerType.charAt(0).toUpperCase() + mediaPickerType.slice(1)}`}
        description={`Choose a ${mediaPickerType === 'all' ? 'media file' : mediaPickerType} from your Cloudinary library`}
      />
    </div>
  )
}
