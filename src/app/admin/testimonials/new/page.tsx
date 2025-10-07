'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TestimonialForm } from '@/components/admin/TestimonialForm'

export default function NewTestimonialPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin#testimonials')
  }

  const handleClose = () => {
    router.push('/admin#testimonials')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Testimonials
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Testimonial</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new client testimonial</p>
            </div>
          </div>

          {/* Form */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <TestimonialForm
                onClose={handleClose}
                onSuccess={handleSuccess}
                isEdit={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
