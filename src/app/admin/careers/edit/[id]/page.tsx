'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CareerForm } from '@/components/admin/CareerForm'
import toast from 'react-hot-toast'

export default function EditCareerPage() {
  const router = useRouter()
  const params = useParams()
  const [career, setCareer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCareer = async () => {
      try {
        const token = localStorage.getItem('admin-token')
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }

        const response = await fetch(`https://nextcoderapi.vercel.app/careers/${params.id}`, { headers })
        
        if (!response.ok) {
          throw new Error('Failed to fetch career')
        }

        const data = await response.json()
        setCareer(data)
      } catch (error) {
        console.error('Error fetching career:', error)
        toast.error('Failed to load job post details', {
          duration: 4000,
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
        router.push('/admin#careers')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCareer()
    }
  }, [params.id, router])

  const handleSuccess = () => {
    router.push('/admin#careers')
  }

  const handleClose = () => {
    router.push('/admin#careers')
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
                Back to Careers
              </Button>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Job Post</h1>
                <p className="text-gray-600 dark:text-gray-400">Loading job post details...</p>
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
              Back to Careers
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Edit Job Post</h1>
              <p className="text-gray-600 dark:text-gray-400">Update job post details</p>
            </div>
          </div>

          {/* Form */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <CareerForm
                onClose={handleClose}
                onSuccess={handleSuccess}
                job={career || undefined}
                isEdit={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
