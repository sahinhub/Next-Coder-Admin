'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AuthNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center justify-center space-x-6 mb-8">
      <Link
        href="/login"
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          pathname === '/login'
            ? "bg-white/20 text-white"
            : "text-white/60 hover:text-white hover:bg-white/10"
        )}
      >
        Sign In
      </Link>
      <Link
        href="/signup"
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
          pathname === '/signup'
            ? "bg-white/20 text-white"
            : "text-white/60 hover:text-white hover:bg-white/10"
        )}
      >
        Sign Up
      </Link>
    </div>
  )
}
