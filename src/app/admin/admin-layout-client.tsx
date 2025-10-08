'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { AppSidebar } from '@/components/admin/app-sidebar'
import { PortfolioForm } from '@/components/admin/PortfolioForm'
import { TestimonialForm } from '@/components/admin/TestimonialForm'
import { CareerForm } from '@/components/admin/CareerForm'
import { Dashboard } from '@/components/admin/Dashboard'
import { PortfolioManagement } from '@/components/admin/PortfolioManagement'
import { TestimonialsManagement } from '@/components/admin/TestimonialsManagement'
import { CareersManagement } from '@/components/admin/CareersManagement'
import { Analytics } from '@/components/admin/Analytics'
import { Settings } from '@/components/admin/Settings'
import { type Project, type Testimonial, type Career } from '@/lib/api'
import Swal from 'sweetalert2'

export default function AdminLayoutClient() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'portfolio' | 'testimonials' | 'careers' | 'analytics' | 'settings'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)

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
  }, [])

  // Listen for hash changes to sync with sidebar navigation
  useEffect(() => {
    if (!isClient) return

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ['dashboard', 'portfolio', 'testimonials', 'careers', 'analytics', 'settings'].includes(hash)) {
        setActiveTab(hash as 'dashboard' | 'portfolio' | 'testimonials' | 'careers' | 'analytics' | 'settings')
      }
    }

    // Set initial tab from hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [isClient])

  // Auth loading effect
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        setAuthLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isClient])

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!isClient) return
    
    setIsDataLoading(true)
    setDataError(null)
    
    try {
      const token = localStorage.getItem('admin-token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
      
      // Fetch all data from Vercel API
      const [portfoliosRes, testimonialsRes, careersRes] = await Promise.all([
        fetch('https://nextcoderapi.vercel.app/portfolios', { headers }).then(res => {
          if (!res.ok) throw new Error(`Portfolios API error: ${res.status}`)
          return res.json()
        }),
        fetch('https://nextcoderapi.vercel.app/testimonials', { headers }).then(res => {
          if (!res.ok) throw new Error(`Testimonials API error: ${res.status}`)
          return res.json()
        }),
        fetch('https://nextcoderapi.vercel.app/careers', { headers }).then(res => {
          if (!res.ok) throw new Error(`Careers API error: ${res.status}`)
          return res.json()
        })
      ])

      // Set the real data from Vercel API
      setProjects(portfoliosRes || [])
      setTestimonials(testimonialsRes || [])
      setCareers(careersRes || [])
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
      setDataError(error instanceof Error ? error.message : 'Failed to fetch data')
      Swal.fire({
        title: 'Error!',
        text: `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
      })
    } finally {
      setIsDataLoading(false)
    }
  }, [isClient])

  // Load data on mount
  useEffect(() => {
    if (isClient && !authLoading) {
      fetchData()
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
      await Swal.fire({
        title: 'Success!',
        text: `${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      
      // Show error alert
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to save settings. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
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
      Swal.fire({
        title: 'Error!',
        text: 'Failed to export settings.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
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
      
      Swal.fire({
        title: 'Success!',
        text: 'Settings imported successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300'
        }
      })
    } catch (error) {
      console.error('Error importing settings:', error)
      Swal.fire({
        title: 'Error!',
        text: 'Failed to import settings. Please check the file format.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'dark:bg-gray-800 dark:text-white',
          title: 'dark:text-white',
          htmlContainer: 'dark:text-gray-300',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
        }
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
        
        // Reset to default settings
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
        }
        
        setSettings(defaultSettings)
        
        if (isClient) {
          localStorage.setItem('admin-settings', JSON.stringify(defaultSettings))
        }
        
        Swal.fire({
          title: 'Success!',
          text: 'Settings have been reset to default values.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'dark:bg-gray-800 dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300'
          }
        })
      } catch (error) {
        console.error('Error resetting settings:', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to reset settings.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'dark:bg-gray-800 dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
          }
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
        const token = localStorage.getItem('admin-token')
        const response = await fetch(`https://nextcoderapi.vercel.app/${type === 'portfolio' ? 'portfolio' : type === 'testimonial' ? 'testimonial' : 'career'}/delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to delete ${type}`)
        }

        // Remove from local state
        if (type === 'portfolio') {
          setProjects(prev => prev.filter(p => p._id !== id))
        } else if (type === 'testimonial') {
          setTestimonials(prev => prev.filter(t => t._id !== id))
        } else if (type === 'career') {
          setCareers(prev => prev.filter(c => c._id !== id))
        }

        await Swal.fire({
          title: 'Deleted!',
          text: `The ${type} has been deleted successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'dark:bg-gray-800 dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300'
          }
        })
      } catch (error) {
        console.error(`Error deleting ${type}:`, error)
        await Swal.fire({
          title: 'Error!',
          text: `Failed to delete ${type}. Please try again.`,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          customClass: {
            popup: 'dark:bg-gray-800 dark:text-white',
            title: 'dark:text-white',
            htmlContainer: 'dark:text-gray-300',
            confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
          }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'portfolio' && 'Portfolio Management'}
                {activeTab === 'testimonials' && 'Testimonials Management'}
                {activeTab === 'careers' && 'Careers Management'}
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
                onClick={fetchData}
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
              onAddPortfolio={() => { setEditingItem(null); setShowPortfolioForm(true); }}
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