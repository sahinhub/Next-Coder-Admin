'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Plus, Edit, Trash2, Star, Calendar, MessageSquare } from 'lucide-react'
import { type Testimonial } from '@/lib/api'

interface TestimonialsManagementProps {
  testimonials: Testimonial[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddTestimonial: () => void
  onEditTestimonial: (testimonial: Testimonial) => void
  onDeleteTestimonial: (id: string) => void
  isLoading?: boolean
}

export function TestimonialsManagement({
  testimonials,
  searchTerm,
  onSearchChange,
  onAddTestimonial,
  onEditTestimonial,
  onDeleteTestimonial,
  isLoading = false
}: TestimonialsManagementProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter testimonials based on search term
  const filteredTestimonials = useMemo(() => {
    if (!searchTerm) return testimonials
    
    return testimonials.filter(testimonial =>
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.review.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [testimonials, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  // Skeleton loading component
  const TestimonialsSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-12 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
              <div className="col-span-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
              <div className="col-span-2">
                <div className="flex space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
              <div className="col-span-1">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="col-span-1">
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <TestimonialsSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage client testimonials and reviews</p>
        </div>
        <Button onClick={onAddTestimonial} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      {paginatedTestimonials.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No testimonials found' : 'No testimonials yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first testimonial'}
          </p>
          {!searchTerm && (
            <Button onClick={onAddTestimonial} className="bg-green-600 hover:bg-green-700 text-white">
              Add Your First Testimonial
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="col-span-4">Client</div>
              <div className="col-span-4">Review</div>
              <div className="col-span-2">Rating</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {paginatedTestimonials.map((testimonial) => (
              <div key={testimonial._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Client Info */}
                  <div className="col-span-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {(testimonial as Testimonial & { clientImage?: string }).clientImage ? (
                          <Image
                            src={(testimonial as Testimonial & { clientImage?: string }).clientImage!}
                            alt={testimonial.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {testimonial.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {testimonial.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {testimonial.featured && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review */}
                  <div className="col-span-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      &ldquo;{testimonial.review}&rdquo;
                    </p>
                  </div>
                  
                  {/* Rating */}
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(testimonial.rating)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        ({testimonial.rating}/5)
                      </span>
                    </div>
                  </div>
                  
                  {/* Date */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{testimonial.date ? new Date(testimonial.date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTestimonial(testimonial)}
                        className="h-8 w-8 p-0"
                        title="Edit testimonial"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTestimonial(testimonial._id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Delete testimonial"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i + 1)}
                className="w-8 h-8 p-0"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
