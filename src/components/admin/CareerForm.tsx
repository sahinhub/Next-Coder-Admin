'use client'

import { useState, useEffect } from 'react'
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
import { X, Save, Plus } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  experienceRequired: z.string().min(1, 'Experience required is needed'),
  employmentType: z.string().min(1, 'Employment type is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  postedDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  status: z.enum(['active', 'paused', 'closed']),
})

type FormData = z.infer<typeof formSchema>

interface CareerFormProps {
  onClose: () => void
  job?: FormData | (Record<string, unknown> & { _id?: string })
  isEdit?: boolean
  onSuccess?: () => void
}

export function CareerForm({ onClose, job, isEdit = false, onSuccess }: CareerFormProps) {
  const [responsibilities, setResponsibilities] = useState<string[]>((job as Record<string, unknown>)?.responsibilities as string[] || [])
  const [skills, setSkills] = useState<string[]>((job as Record<string, unknown>)?.skills as string[] || [])
  const [newResponsibility, setNewResponsibility] = useState('')
  const [newSkill, setNewSkill] = useState('')
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

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 300) // Match the animation duration
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
      postedDate: (job as Record<string, unknown>)?.postedDate as string || new Date().toISOString().split('T')[0],
      applicationDeadline: (job as Record<string, unknown>)?.applicationDeadline as string || '',
      status: (job as Record<string, unknown>)?.status as 'active' | 'paused' | 'closed' || 'active',
    },
  })

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
        status: data.status,
      }

      let url = 'https://nextcoderapi.vercel.app/careers'
      let method = 'POST'
      
      if (isEdit && job && '_id' in job && job._id) {
        url = `https://nextcoderapi.vercel.app/career/update/${job._id}`
        method = 'PUT'
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(careerData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? 'update' : 'create'} career`)
      }

      const result = await response.json()
      console.log(`Successfully ${isEdit ? 'updated' : 'created'} career:`, result)
      
      toast.success(`Job posting ${isEdit ? 'updated' : 'created'} successfully!`)
      
      // Success - refresh data and close form
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving career:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save job posting. Please try again.'
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
                <CardTitle className="text-xl">{isEdit ? 'Edit Job Posting' : 'Add New Job Posting'}</CardTitle>
                <CardDescription>
                  {isEdit ? 'Update job posting information' : 'Create a new job posting'}
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
                        <Input type="date" {...field} />
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
                        <Input type="date" {...field} />
                      </FormControl>
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
                        {isEdit ? 'Update Job Posting' : 'Create Job Posting'}
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
