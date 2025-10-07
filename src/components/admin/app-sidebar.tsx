"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  User,
  ChevronUp,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from '@/hooks/useAuth'
import Swal from 'sweetalert2'

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#dashboard" },
  { name: "Portfolio", icon: Briefcase, href: "#portfolio" },
  { name: "Testimonials", icon: MessageSquare, href: "#testimonials" },
  { name: "Careers", icon: Users, href: "#careers" },
  { name: "Analytics", icon: BarChart3, href: "#analytics" },
  { name: "Settings", icon: Settings, href: "#settings" },
]

interface AppSidebarProps {
  collapsed?: boolean
}

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
  const { user, logout, changePassword } = useAuth()
  const [currentPath, setCurrentPath] = useState('dashboard')

  // Update current path when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ['dashboard', 'portfolio', 'testimonials', 'careers', 'analytics', 'settings'].includes(hash)) {
        setCurrentPath(hash)
      }
    }

    // Set initial tab from hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Handle navigation
  const handleNavigation = (href: string) => {
    const path = href.replace('#', '')
    setCurrentPath(path)
    window.location.hash = href
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className={`flex items-center gap-2 p-2.5 border-b border-gray-200 dark:border-gray-700`}>
        <Link href="/">
          <Image src="/We-Next-Coder.png" className='bg-gray-50 dark:bg-gray-600 rounded-lg p-2' alt="Logo" width={42} height={42} />
        </Link>
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white"> Next Coder</h2>
        )}
       
      </div>

      {/* Navigation */}
      <div className={`overflow-y-auto ${collapsed ? 'p-2' : 'p-4'}`}>
        <div className="space-y-2">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Navigation
            </h3>
          )}
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                handleNavigation(item.href)
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPath === item.href.replace('#', '')
                  ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </a>
          ))}
        </div>

        
      </div>

      {/* Footer */}
      <div className={`mt-auto border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'p-2' : 'p-4'}`} >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-green-900">
                <User className="h-4 w-4 text-green-600 dark:text-purple-400" />
              </div>
              {!collapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@wenextcoder.com'}</p>
                  {user?.lastLogin && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Last login: {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              {!collapsed && <ChevronUp className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            side="top"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem 
              className="gap-2"
              onClick={() => {
                window.location.href = '/admin/account'
              }}
            >
              <User className="h-4 w-4" />
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2"
              onClick={() => {
                window.location.hash = '#settings'
              }}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-red-600 dark:text-red-400 "
              onClick={async () => {
                const result = await Swal.fire({
                  title: 'Logout?',
                  text: 'Are you sure you want to logout?',
                  icon: 'question',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#6b7280',
                  confirmButtonText: 'Yes, logout',
                  cancelButtonText: 'Cancel',
                  customClass: {
                    popup: 'dark:bg-gray-800 dark:text-white',
                    title: 'dark:text-white',
                    htmlContainer: 'dark:text-gray-300',
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
                    cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white'
                  }
                })
                
                if (result.isConfirmed) {
                  await logout()
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}