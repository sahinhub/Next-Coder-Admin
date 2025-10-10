'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { RefreshCw, Sidebar } from 'lucide-react'
import { AppSidebar } from '@/components/admin/app-sidebar'
import dynamic from 'next/dynamic'

// Lazy load heavy components without loading states for instant transitions
const PortfolioForm = dynamic(() => import('@/components/admin/PortfolioForm').then(mod => ({ default: mod.PortfolioForm })))
const TestimonialForm = dynamic(() => import('@/components/admin/TestimonialForm').then(mod => ({ default: mod.TestimonialForm })))
const CareerForm = dynamic(() => import('@/components/admin/CareerForm').then(mod => ({ default: mod.CareerForm })))
const Dashboard = dynamic(() => import('@/components/admin/Dashboard').then(mod => ({ default: mod.Dashboard })))
const PortfolioManagement = dynamic(() => import('@/components/admin/PortfolioManagement').then(mod => ({ default: mod.PortfolioManagement })))
const TestimonialsManagement = dynamic(() => import('@/components/admin/TestimonialsManagement').then(mod => ({ default: mod.TestimonialsManagement })))
const CareersManagement = dynamic(() => import('@/components/admin/CareersManagement').then(mod => ({ default: mod.CareersManagement })))
const MediaManagement = dynamic(() => import('@/components/admin/MediaManagement').then(mod => ({ default: mod.MediaManagement })))
const Analytics = dynamic(() => import('@/components/admin/Analytics').then(mod => ({ default: mod.Analytics })))
const Settings = dynamic(() => import('@/components/admin/Settings').then(mod => ({ default: mod.Settings })))
import { type Project, type Testimonial, type Career, projectsApi, testimonialsApi, careersApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function AdminLayoutClient() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'testimonials' | 'careers' | 'media' | 'analytics' | 'settings'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Data states
  const [projects, setProjects] = useState<Project[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [careers, setCareers] = useState<Career[]>([])

  // Form states
  const [showPortfolioForm, setShowPortfolioForm] = useState(false)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [showCareerForm, setShowCareerForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null)

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    portfolioViews: 0,
    testimonialViews: 0,
    careerViews: 0,
    monthlyGrowth: 0,
    topPortfolios: [] as Project[],
    recentActivity: [] as Array<{
      id: string
      type: string
      description: string
      timestamp: string
      color: string
    }>
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Settings states
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Next Coder',
      companyName: 'We Next Coder',
      contactEmail: 'admin@wenextcoder.com',
      contactPhone: '+1 (555) 123-4567',
      timezone: 'UTC',
      language: 'en'
    },
    display: {
      darkMode: false,
      showAnalytics: true,
      autoSave: true,
      showNotifications: true,
      itemsPerPage: 10
    },
    account: {
      fullName: 'Admin User',
      email: 'admin@wenextcoder.com',
      username: 'admin',
      bio: 'Administrator of Next Coder platform',
      location: 'Global',
      website: 'https://wenextcoder.com'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      securityAlerts: true,
      newTestimonials: true,
      newApplications: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: [] as string[],
      loginAlerts: true
    },
    api: {
      webhookUrl: '',
      rateLimit: 1000,
      enableCors: true,
      debugMode: false
    }
  })
  const [isSaving, setIsSaving] = useState(false)

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true)
    setMounted(true)
    
    // Check if mobile
    const checkMobile = () => {
      try {
        if (typeof window !== 'undefined') {
          setIsMobile(window.innerWidth < 1024) // lg breakpoint
          if (window.innerWidth < 1024) {
            setSidebarCollapsed(true) // Collapse on mobile by default
          }
        }
      } catch (error) {
        console.error('Error checking mobile:', error)
      }
    }
    
    // Detect system theme for dark mode
    const detectSystemTheme = () => {
      if (typeof window !== 'undefined') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setSettings(prev => ({
          ...prev,
          display: {
            ...prev.display,
            darkMode: isDark
          }
        }))
      }
    }
    
    checkMobile()
    detectSystemTheme()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile)
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', detectSystemTheme)
      
      return () => {
        window.removeEventListener('resize', checkMobile)
        mediaQuery.removeEventListener('change', detectSystemTheme)
      }
    }
  }, [])

  // Listen for hash changes to sync with sidebar navigation
  useEffect(() => {
    if (!isClient) return

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ['dashboard', 'portfolio', 'testimonials', 'careers', 'media', 'analytics', 'settings'].includes(hash)) {
        setActiveTab(hash as 'dashboard' | 'portfolio' | 'testimonials' | 'careers' | 'media' | 'analytics' | 'settings')
      }
    }

    // Set initial tab from hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [isClient])

  // Auth loading effect - reduced for faster LCP
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        setAuthLoading(false)
      }, 300) // Reduced from 1000ms to 300ms
      return () => clearTimeout(timer)
    }
  }, [isClient])

  // Fetch data function with caching and optimization
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isClient) return
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = localStorage.getItem('admin-cache')
      const cacheTime = localStorage.getItem('admin-cache-time')
      
      if (cachedData && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime)
        const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes for better performance
        
        if (cacheAge < CACHE_DURATION) {
          try {
            const parsed = JSON.parse(cachedData)
            setProjects(parsed.projects || [])
            setTestimonials(parsed.testimonials || [])
            setCareers(parsed.careers || [])
            setLastRefresh(new Date(parseInt(cacheTime)))
            return
          } catch {
            console.warn('Cache parse error, fetching fresh data')
          }
        }
      }
    }
    
    setIsDataLoading(true)
    setDataError(null)
    
    try {
      const token = localStorage.getItem('admin-token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
      
      // Fetch data with optimized caching using local API routes
      const [portfoliosRes, testimonialsRes, careersRes] = await Promise.all([
        fetch('/api/portfolios', { 
          headers,
          cache: 'force-cache',
          next: { revalidate: 300 } // 5 minutes
        }).then(async res => {
          if (!res.ok) throw new Error(`Portfolios API error: ${res.status}`)
          try {
            return await res.json()
          } catch (parseError) {
            console.error('Error parsing portfolios JSON:', parseError)
            return []
          }
        }),
        fetch('/api/testimonials', { 
          headers,
          cache: 'force-cache',
          next: { revalidate: 300 }
        }).then(async res => {
          if (!res.ok) throw new Error(`Testimonials API error: ${res.status}`)
          try {
            return await res.json()
          } catch (parseError) {
            console.error('Error parsing testimonials JSON:', parseError)
            return []
          }
        }),
        fetch('/api/careers', { 
          headers,
          cache: 'force-cache',
          next: { revalidate: 300 }
        }).then(async res => {
          if (!res.ok) throw new Error(`Careers API error: ${res.status}`)
          try {
            return await res.json()
          } catch (parseError) {
            console.error('Error parsing careers JSON:', parseError)
            return []
          }
        })
      ])

      const data = {
        projects: portfoliosRes || [],
        testimonials: testimonialsRes || [],
        careers: careersRes || []
      }

      // Set the real data from Vercel API
      setProjects(data.projects)
      setTestimonials(data.testimonials)
      setCareers(data.careers)
      setLastRefresh(new Date())
      
      // Cache the data
      localStorage.setItem('admin-cache', JSON.stringify(data))
      localStorage.setItem('admin-cache-time', Date.now().toString())
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setDataError(error instanceof Error ? error.message : 'Failed to fetch data')
      toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 5000,
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
    } finally {
      setIsDataLoading(false)
    }
  }, [isClient])

  // Load data on mount with immediate loading state
  useEffect(() => {
    if (isClient && !authLoading) {
      // Set loading state immediately for better UX
      setIsDataLoading(true)
      // Small delay to allow skeleton to render
      const timer = setTimeout(() => {
        fetchData()
      }, 50)
      
      return () => clearTimeout(timer)
    }
  }, [isClient, authLoading, fetchData])

  // Calculate analytics
  const calculateAnalytics = useCallback(() => {
    const totalPortfolios = projects.length
    const totalTestimonials = testimonials.length
    const totalCareers = careers.length
    
    // Simulate some analytics data
    const portfolioViews = totalPortfolios * 150 + Math.floor(Math.random() * 1000)
    const testimonialViews = totalTestimonials * 75 + Math.floor(Math.random() * 500)
    const careerViews = totalCareers * 200 + Math.floor(Math.random() * 800)
    const totalViews = portfolioViews + testimonialViews + careerViews
    
    const monthlyGrowth = Math.floor(Math.random() * 20) + 5 // 5-25% growth
    
    // Top performing portfolios (simulated)
    const topPortfolios = [...projects]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    // Recent activity (simulated)
    const recentActivity = [
      {
        id: '1',
        type: 'portfolio',
        description: 'New portfolio project added',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        color: 'green'
      },
      {
        id: '2',
        type: 'testimonial',
        description: 'New testimonial received',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        color: 'blue'
      },
      {
        id: '3',
        type: 'career',
        description: 'Job posting published',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        color: 'orange'
      }
    ]
    
    setAnalyticsData({
      totalViews,
      portfolioViews,
      testimonialViews,
      careerViews,
      monthlyGrowth,
      topPortfolios,
      recentActivity
    })
  }, [projects, testimonials, careers])

  // Update analytics when data changes
  useEffect(() => {
    if (isClient) {
      calculateAnalytics()
    }
  }, [isClient, calculateAnalytics])

  // Load settings from localStorage
  useEffect(() => {
    if (isClient) {
      const savedSettings = localStorage.getItem('admin-settings')
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (error) {
          console.error('Error loading settings:', error)
        }
      }
    }
  }, [isClient])

  // Update settings function
  const updateSettings = async (section: string, field: string, value: unknown) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section as keyof typeof settings],
        [field]: value
      }
    }
    setSettings(newSettings)
    
    // Save to localStorage only
    if (isClient) {
      localStorage.setItem('admin-settings', JSON.stringify(newSettings))
      console.log('Settings saved to localStorage')
    }
  }

  // Handle theme change
  const handleThemeChange = (checked: boolean) => {
    updateSettings('display', 'darkMode', checked)
    // Apply theme change immediately
    if (checked) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Handle save settings
  const handleSaveSettings = async (section: string) => {
    setIsSaving(true)
    try {
      // Save to localStorage only
      if (isClient) {
        localStorage.setItem('admin-settings', JSON.stringify(settings))
        console.log(`Successfully saved ${section} settings to localStorage`)
      }
      
      // Show success alert
      toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`, {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: document.documentElement.classList.contains('dark') 
            ? 'rgba(9, 222, 66,0.3)' 
            : '#09de42',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      
      // Show error alert
      toast.error('Failed to save settings. Please try again.', {
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
    } finally {
      setIsSaving(false)
    }
  }

  // Handle export settings
  const handleExportSettings = async () => {
    try {
      const token = localStorage.getItem('admin-token')
      const response = await fetch('https://nextcoderapi.vercel.app/settings/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to export settings')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'admin-settings.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting settings:', error)
      toast.error('Failed to export settings.', {
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
    }
  }

  // Handle import settings
  const handleImportSettings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importedSettings = JSON.parse(text)
      
      // Validate settings structure
      if (typeof importedSettings !== 'object' || !importedSettings.general) {
        throw new Error('Invalid settings file format')
      }
      
      setSettings(importedSettings)
      
      if (isClient) {
        localStorage.setItem('admin-settings', JSON.stringify(importedSettings))
      }
      
      toast.success('Settings imported successfully!', {
        duration: 3000,
        position: 'bottom-right',
        style: {
          background: document.documentElement.classList.contains('dark') 
            ? 'rgba(9, 222, 66,0.3)' 
            : '#09de42',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    } catch (error) {
      console.error('Error importing settings:', error)
      toast.error('Failed to import settings. Please check the file format.', {
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
    }
  }

  // Handle reset settings
  const handleResetSettings = async () => {
    const result = await Swal.fire({
      title: 'Reset Settings?',
      text: 'This will reset all settings to their default values. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reset settings',
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
      try {
        const token = localStorage.getItem('admin-token')
        await fetch('https://nextcoderapi.vercel.app/settings/reset', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        // Reset to default settings - detect system theme
        const isSystemDark = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false
        
        const defaultSettings = {
          general: {
            siteName: 'Next Coder',
            companyName: 'We Next Coder',
            contactEmail: 'admin@wenextcoder.com',
            contactPhone: '+1 (555) 123-4567',
            timezone: 'UTC',
            language: 'en'
          },
          display: {
            darkMode: isSystemDark,
            showAnalytics: true,
            autoSave: true,
            showNotifications: true,
            itemsPerPage: 10
          },
          account: {
            fullName: 'Admin User',
            email: 'admin@wenextcoder.com',
            username: 'admin',
            bio: 'Administrator of Next Coder platform',
            location: 'Global',
            website: 'https://wenextcoder.com'
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            weeklyReports: true,
            securityAlerts: true,
            newTestimonials: true,
            newApplications: true
          },
          security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            passwordExpiry: 90,
            loginAttempts: 5,
            ipWhitelist: [] as string[],
            loginAlerts: true
          },
          api: {
            webhookUrl: '',
            rateLimit: 1000,
            enableCors: true,
            debugMode: false
          }
        }
        
        setSettings(defaultSettings)
        
        if (isClient) {
          localStorage.setItem('admin-settings', JSON.stringify(defaultSettings))
        }
        
        toast.success('Settings have been reset to default values.', {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: document.documentElement.classList.contains('dark') 
              ? 'rgba(9, 222, 66,0.3)' 
              : '#09de42',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        })
      } catch (error) {
        console.error('Error resetting settings:', error)
        toast.error('Failed to reset settings.', {
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
      }
    }
  }

  // Handle delete
  const handleDelete = async (id: string, type: 'portfolio' | 'testimonial' | 'career') => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete this ${type}. This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
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
      try {
        // Use the appropriate API function
        if (type === 'portfolio') {
          await projectsApi.delete(id)
          setProjects(prev => prev.filter(p => p._id !== id))
        } else if (type === 'testimonial') {
          await testimonialsApi.delete(id)
          setTestimonials(prev => prev.filter(t => t._id !== id))
        } else if (type === 'career') {
          await careersApi.delete(id)
          setCareers(prev => prev.filter(c => c._id !== id))
        }

        toast.success(`The ${type} has been deleted successfully.`, {
          duration: 3000,
          position: 'bottom-right',
          style: {
            background: document.documentElement.classList.contains('dark') 
              ? 'rgba(9, 222, 66,0.3)' 
              : '#09de42',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        })
      } catch (error) {
        console.error(`Error deleting ${type}:`, error)
        toast.error(`Failed to delete ${type}. Please try again.`, {
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
      }
    }
  }

  // Handle edit
  const handleEdit = (item: Record<string, unknown>, type: 'portfolio' | 'testimonial' | 'career') => {
    setEditingItem(item)
    if (type === 'portfolio') {
      setShowPortfolioForm(true)
    } else if (type === 'testimonial') {
      setShowTestimonialForm(true)
    } else if (type === 'career') {
      setShowCareerForm(true)
    }
  }

  // Prevent hydration mismatch by only rendering on client
  if (!isClient || !mounted || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Image
              src="/We-Next-Coder.png"
              alt="We Next Coder"
              width={60}
              height={60}
              priority
              className="mx-auto mb-4"
            />
            <div className="loading-skeleton h-3 w-24 mx-auto rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Overlay */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={(e) => {
            e.preventDefault()
            try {
              setSidebarCollapsed(true)
            } catch (error) {
              console.error('Error closing sidebar:', error)
            }
          }}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? 'fixed z-50' : 'relative'} ${
        isMobile && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      } transition-transform duration-300 shadow-md dark:shadow-gray-700 z-10`}>
        <AppSidebar 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  setSidebarCollapsed(!sidebarCollapsed)
                }}
                className="h-8 w-8 p-0"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <Sidebar className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'portfolio' && 'Portfolio Management'}
                {activeTab === 'testimonials' && 'Testimonials Management'}
                {activeTab === 'careers' && 'Careers Management'}
                {activeTab === 'media' && 'Media Management'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              {lastRefresh && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchData(true)}
                disabled={isDataLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Loading Indicator */}
          {isDataLoading && (
            <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
              Loading...
            </div>
          )}
          
          {/* Error Display */}
          {dataError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{dataError}</p>
            </div>
          )}

          {/* Main Content */}
          <div className="transition-all duration-200 ease-in-out">
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                projects={projects}
                testimonials={testimonials}
                careers={careers}
                analyticsData={analyticsData}
                analyticsLoading={analyticsLoading}
                lastRefresh={lastRefresh}
                isDataLoading={isDataLoading}
                onRefresh={fetchData}
                onTabChange={(tab) => {
                  window.location.hash = `#${tab}`
                }}
              />
            )}

            {/* Portfolio Management */}
            {activeTab === 'portfolio' && (
              <PortfolioManagement
                projects={projects}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddPortfolio={() => { 
                  setEditingItem(null); 
                  setShowPortfolioForm(true); 
                }}
                onEditPortfolio={(portfolio) => handleEdit(portfolio as unknown as Record<string, unknown>, 'portfolio')}
                onDeletePortfolio={(id) => handleDelete(id, 'portfolio')}
              />
            )}

            {/* Testimonials Management */}
            {activeTab === 'testimonials' && (
              <TestimonialsManagement
                testimonials={testimonials}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddTestimonial={() => { setEditingItem(null); setShowTestimonialForm(true); }}
                onEditTestimonial={(testimonial) => handleEdit(testimonial as unknown as Record<string, unknown>, 'testimonial')}
                onDeleteTestimonial={(id) => handleDelete(id, 'testimonial')}
              />
            )}

            {/* Careers Management */}
            {activeTab === 'careers' && (
              <CareersManagement
                careers={careers}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddCareer={() => { setEditingItem(null); setShowCareerForm(true); }}
                onEditCareer={(career) => handleEdit(career as unknown as Record<string, unknown>, 'career')}
                onDeleteCareer={(id) => handleDelete(id, 'career')}
              />
            )}

            {/* Media Management */}
            {activeTab === 'media' && (
              <MediaManagement
                onUploadSuccess={(url) => {
                  console.log('New media uploaded:', url)
                  // You can add logic here to refresh media list or update state
                }}
              />
            )}

            {/* Analytics Dashboard */}
            {activeTab === 'analytics' && (
              <Analytics
                projects={projects}
                testimonials={testimonials}
                careers={careers}
                analyticsData={analyticsData}
                analyticsLoading={analyticsLoading}
                lastRefresh={lastRefresh}
                isDataLoading={isDataLoading}
                onRefresh={() => {
                      setAnalyticsLoading(true)
                  fetchData().finally(() => setAnalyticsLoading(false))
                }}
                onTabChange={(tab) => {
                  window.location.hash = `#${tab}`
                }}
              />
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <Settings
                settings={settings}
                onUpdateSettings={updateSettings}
                onSaveSettings={handleSaveSettings}
                onExportSettings={handleExportSettings}
                onImportSettings={handleImportSettings}
                onResetSettings={handleResetSettings}
                onThemeChange={handleThemeChange}
                isSaving={isSaving}
              />
            )}
          </div>
                            </div>
                              </div>

      {/* Form Modals */}
      {showPortfolioForm && (
        <PortfolioForm
          onClose={() => {
            setShowPortfolioForm(false)
            setEditingItem(null)
          }}
          portfolio={editingItem || undefined}
          isEdit={!!editingItem}
          onSuccess={() => {
            setShowPortfolioForm(false)
            setEditingItem(null)
            fetchData()
          }}
        />
      )}

      {showTestimonialForm && (
        <TestimonialForm
          onClose={() => {
            setShowTestimonialForm(false)
            setEditingItem(null)
          }}
          testimonial={editingItem || undefined}
          isEdit={!!editingItem}
          onSuccess={() => {
            setShowTestimonialForm(false)
            setEditingItem(null)
            fetchData()
          }}
        />
      )}

      {showCareerForm && (
        <CareerForm
          onClose={() => {
            setShowCareerForm(false)
            setEditingItem(null)
          }}
          job={editingItem || undefined}
          isEdit={!!editingItem}
          onSuccess={() => {
            setShowCareerForm(false)
            setEditingItem(null)
            fetchData()
          }}
        />
      )}
                            </div>
  )
}