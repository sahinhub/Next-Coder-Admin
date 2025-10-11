'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Image from 'next/image'
import AdminLayoutClient from './admin-layout-client'

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check authentication status
    const authStatus = isAuthenticated()
    setIsAuth(authStatus)
    
    // Redirect to login if not authenticated
    if (!authStatus) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 10)
      return () => clearTimeout(timer)
    }
  }, [router])

  // Show loading state while checking auth
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/We-Next-Coder.png"
            alt="We Next Coder"
            width={80}
            height={80}
            priority
            className="mx-auto mb-4"
          />
          <div className="loading-skeleton h-4 w-32 mx-auto rounded"></div>
        </div>
      </div>
    )
  }

  // Show loading state if not authenticated (will redirect)
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/We-Next-Coder.png"
            alt="We Next Coder"
            width={80}
            height={80}
            priority
            className="mx-auto mb-4"
          />
          <div className="loading-skeleton h-4 w-32 mx-auto rounded"></div>
        </div>
      </div>
    )
  }

  // Render admin dashboard if authenticated
  return <AdminLayoutClient />
}