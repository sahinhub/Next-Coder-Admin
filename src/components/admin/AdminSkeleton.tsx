'use client'

import Image from 'next/image'

export function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/We-Next-Coder.png"
                alt="We Next Coder"
                width={40}
                height={40}
                priority
                className="mr-3"
              />
              <div className="loading-skeleton h-6 w-32 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="loading-skeleton h-8 w-8 rounded-full"></div>
              <div className="loading-skeleton h-8 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <div className="loading-skeleton h-5 w-5 rounded"></div>
                  <div className="loading-skeleton h-4 w-24 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Page Header */}
            <div>
              <div className="loading-skeleton h-8 w-48 rounded mb-2"></div>
              <div className="loading-skeleton h-4 w-64 rounded"></div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="loading-skeleton h-4 w-20 rounded mb-2"></div>
                      <div className="loading-skeleton h-8 w-16 rounded"></div>
                    </div>
                    <div className="loading-skeleton h-8 w-8 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="loading-skeleton h-6 w-32 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="loading-skeleton h-12 w-12 rounded"></div>
                      <div className="flex-1">
                        <div className="loading-skeleton h-4 w-48 rounded mb-2"></div>
                        <div className="loading-skeleton h-3 w-32 rounded"></div>
                      </div>
                      <div className="loading-skeleton h-8 w-20 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

