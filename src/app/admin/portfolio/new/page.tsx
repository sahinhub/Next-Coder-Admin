'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PortfolioForm } from '@/components/admin/PortfolioForm'

export default function NewPortfolioPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/admin#portfolio')
  }

  const handleClose = () => {
    router.push('/admin#portfolio')
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
              Back to Portfolios
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Add New Portfolio</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new portfolio project</p>
            </div>
          </div>

          {/* Form */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <PortfolioForm
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
