'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestAdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Set up test user session
    localStorage.setItem('admin_token', 'test_token_123')
    localStorage.setItem('admin_user', JSON.stringify({
      id: '1',
      name: 'Test Admin',
      email: 'test@wenextcoder.com',
      role: 'admin'
    }))
    
    // Redirect to admin dashboard
    router.push('/admin')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Setting up test session...</p>
      </div>
    </div>
  )
}
