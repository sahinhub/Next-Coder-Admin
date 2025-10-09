'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Immediate redirect for better LCP
    const timer = setTimeout(() => {
      if (isAuthenticated()) {
        router.push('/admin')
      } else {
        router.push('/login')
      }
    }, 10) // Minimal delay for better LCP

    return () => clearTimeout(timer)
  }, [router])

  // Optimized loading state with critical image
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