'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TestimonialForm } from '@/components/admin/TestimonialForm'
import Swal from 'sweetalert2'

export default function EditTestimonialPage() {
  const router = useRouter()
  const params = useParams()
  const [testimonial, setTestimonial] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const token = localStorage.getItem('admin-token')
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }

        const response = await fetch(`https://nextcoderapi.vercel.app/testimonials/${params.id}`, { headers })
        
        if (!response.ok) {
          throw new Error('Failed to fetch testimonial')
        }

        const data = await response.json()
        setTestimonial(data)
      } catch (error) {
        console.error('Error fetching testimonial:', error)
        await Swal.fire({
          title: 'Error!',
          text: 'Failed to load testimonial details',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'dark:bg-gray-800 dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
          }
        })
        router.push('/admin#testimonials')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchTestimonial()
    }
  }, [params.id, router])

  const handleSuccess = () => {
    router.push('/admin#testimonials')
  }

  const handleClose = () => {
    router.push('/admin#testimonials')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Testimonial</h1>
                <p className="text-gray-600 dark:text-gray-400">Loading testimonial details...</p>
              </div>
            </div>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Testimonial</h1>
              <p className="text-gray-600 dark:text-gray-400">Update testimonial details</p>
            </div>
          </div>

          {/* Form */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <TestimonialForm
                onClose={handleClose}
                onSuccess={handleSuccess}
                testimonial={testimonial || undefined}
                isEdit={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
