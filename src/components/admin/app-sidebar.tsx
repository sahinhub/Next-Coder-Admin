"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Users,
  Settings,
  User,
  ChevronUp,
  LogOut,
  Image as ImageIcon,
  ChevronDown,
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
  { name: "Media", icon: ImageIcon, href: "#media" },
  { name: "Settings", icon: Settings, href: "#settings" },
]

interface AppSidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AppSidebar({ collapsed = false, }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const [currentPath, setCurrentPath] = useState('dashboard')

  // Update current path when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ['dashboard', 'portfolio', 'testimonials', 'careers', 'media', 'analytics', 'settings'].includes(hash)) {
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
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-2 p-2 pb-3.5 border-b border-gray-200 dark:border-gray-700 ${
        collapsed ? 'justify-center p-1' : 'justify-between'
      }`}>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image 
              src="/We-Next-Coder.png" 
              className='bg-gray-50 dark:bg-gray-600 rounded-lg p-2' 
              alt="Logo" 
              width={collapsed ? 42 : 42} 
              height={collapsed ? 42 : 42} 
            />
          </Link>
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Next Coder</h2>
          )}
        </div>
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
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : ''}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </a>
          ))}
        </div>

        
      </div>

      {/* Footer */}
      <div className={`mt-auto border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'p-2' : 'p-4'}`}>
        {/* User Profile Section */}
        <div className="mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full h-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${
                  collapsed ? 'justify-center' : 'justify-start gap-3'
                }`}
                title={collapsed ? `${user?.username || 'Admin User'}` : 'User'}
              >
                <div className="flex flex-shrink-0 h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600 dark:from-green-500 dark:to-blue-600 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                {!collapsed ? (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.username || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email || 'admin@wenextcoder.com'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                      </div>
                    </div>
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  </>
                ):<ChevronDown className="h-4 w-4 text-gray-400"/>
              }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-full mx-1 p-2"
              side="top"
              align="end"
              sideOffset={8}
            >
              

              {/* Menu Items */}
              <DropdownMenuItem 
                className="gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-white group transition-colors duration-300 hover:cursor-pointer"
                onClick={() => {
                  window.location.href = '/admin/account'
                }}
              >
                <User className="h-4 w-4 text-gray-500 group-hover:text-white" />
                <div className="flex-1 group-hover:text-white">
                  <span className="text-sm font-medium">Account Settings</span>
                  <p className="text-xs text-gray-500 group-hover:text-white">Manage your profile</p>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors duration-300 hover:cursor-pointer"
                onClick={() => {
                  window.location.hash = '#settings'
                }}
              >
                <Settings className="h-4 w-4 text-gray-500 group-hover:text-white" />
                <div className="flex-1">
                  <span className="text-sm font-medium group-hover:text-white">Preferences</span>
                  <p className="text-xs text-gray-500 group-hover:text-white">Customize your experience</p>
                </div>
              </DropdownMenuItem>

              <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
              
              <DropdownMenuItem
                className="gap-3 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 group transition-colors duration-300 hover:cursor-pointer"
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
                <LogOut className="h-4 w-4 group-hover:text-white " />
                <div className="flex-1 ">
                  <span className="text-sm font-medium ">Sign out</span>
                  <p className="text-xs text-red-500 dark:text-red-400">End your session</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* App Version & Status */}
        {!collapsed && (
          <div className="text-center">
            <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">
              We Next Coder Admin
            </div>
            <div className="text-xs text-gray-300 dark:text-gray-600">
              v1.0.0 • All systems operational
            </div>
          </div>
        )}
      </div>
    </div>
  )
}