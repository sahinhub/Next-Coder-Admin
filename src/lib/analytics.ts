const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nextcoderapi.vercel.app'

export interface ViewEvent {
  type: 'portfolio' | 'testimonial' | 'career' | 'page'
  itemId?: string
  page: string
  timestamp: string
  userAgent?: string
  referrer?: string
}

export interface ActivityEvent {
  type: 'create' | 'update' | 'delete' | 'view'
  category: 'portfolio' | 'testimonial' | 'career' | 'user'
  itemId: string
  itemTitle: string
  adminId: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface AnalyticsData {
  totalViews: number
  portfolioViews: number
  testimonialViews: number
  careerViews: number
  pageViews: number
  monthlyGrowth: number
  topPortfolios: Array<{
    _id: string
    title: string
    views: number
    categories: string[]
  }>
  recentActivity: ActivityEvent[]
  dailyViews: Array<{
    date: string
    views: number
  }>
  monthlyStats: {
    currentMonth: number
    previousMonth: number
    growth: number
  }
}

class AnalyticsService {
  private static instance: AnalyticsService
  private viewQueue: ViewEvent[] = []
  private activityQueue: ActivityEvent[] = []
  private readonly BATCH_SIZE = 10
  private readonly FLUSH_INTERVAL = 30000 // 30 seconds

  private constructor() {
    // Start periodic flush
    setInterval(() => this.flushQueues(), this.FLUSH_INTERVAL)
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushQueues())
    }
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  // Track page views
  public trackView(type: ViewEvent['type'], page: string, itemId?: string): void {
    if (typeof window === 'undefined') return

    const viewEvent: ViewEvent = {
      type,
      itemId,
      page,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    }

    this.viewQueue.push(viewEvent)
    
    // Flush if queue is full
    if (this.viewQueue.length >= this.BATCH_SIZE) {
      this.flushViewQueue()
    }
  }

  // Track admin activities
  public trackActivity(
    type: ActivityEvent['type'],
    category: ActivityEvent['category'],
    itemId: string,
    itemTitle: string,
    adminId: string,
    details?: Record<string, unknown>
  ): void {
    const activityEvent: ActivityEvent = {
      type,
      category,
      itemId,
      itemTitle,
      adminId,
      timestamp: new Date().toISOString(),
      details
    }

    this.activityQueue.push(activityEvent)
    
    // Flush if queue is full
    if (this.activityQueue.length >= this.BATCH_SIZE) {
      this.flushActivityQueue()
    }
  }

  // Get analytics data
  public async getAnalyticsData(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    try {
      const token = localStorage.getItem('admin-token')
      console.log('🔍 Fetching analytics data from:', `${API_BASE_URL}/analytics/data?period=${period}`)
      
      const response = await fetch(`${API_BASE_URL}/analytics/data?period=${period}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      console.log('📡 Analytics API response status:', response.status)
      console.log('📡 Analytics API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Analytics API error response:', errorText)
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Analytics data received:', data)
      return data
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error)
      console.log('🔄 Returning fallback analytics data')
      // Return fallback data
      return this.getFallbackAnalyticsData()
    }
  }

  // Get real-time stats
  public async getRealTimeStats(): Promise<{
    totalViews: number
    todayViews: number
    onlineUsers: number
  }> {
    try {
      const token = localStorage.getItem('admin-token')
      console.log('🔍 Fetching real-time stats from:', `${API_BASE_URL}/analytics/realtime`)
      
      const response = await fetch(`${API_BASE_URL}/analytics/realtime`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      console.log('📡 Real-time stats API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Real-time stats API error response:', errorText)
        throw new Error(`Failed to fetch real-time stats: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Real-time stats received:', data)
      return data
    } catch (error) {
      console.error('❌ Error fetching real-time stats:', error)
      console.log('🔄 Returning fallback real-time stats')
      return {
        totalViews: Math.floor(Math.random() * 5000) + 1000,
        todayViews: Math.floor(Math.random() * 200) + 50,
        onlineUsers: Math.floor(Math.random() * 20) + 5
      }
    }
  }

  // Flush view queue
  private async flushViewQueue(): Promise<void> {
    if (this.viewQueue.length === 0) return

    try {
      const token = localStorage.getItem('admin-token')
      await fetch(`${API_BASE_URL}/analytics/views`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ views: this.viewQueue })
      })

      this.viewQueue = []
    } catch (error) {
      console.error('Error flushing view queue:', error)
    }
  }

  // Flush activity queue
  private async flushActivityQueue(): Promise<void> {
    if (this.activityQueue.length === 0) return

    try {
      const token = localStorage.getItem('admin-token')
      await fetch(`${API_BASE_URL}/analytics/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ activities: this.activityQueue })
      })

      this.activityQueue = []
    } catch (error) {
      console.error('Error flushing activity queue:', error)
    }
  }

  // Flush all queues
  private async flushQueues(): Promise<void> {
    await Promise.all([
      this.flushViewQueue(),
      this.flushActivityQueue()
    ])
  }

  // Fallback data when API is unavailable
  private getFallbackAnalyticsData(): AnalyticsData {
    // Generate sample data for demonstration
    const dailyViews = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Create wave-like pattern for demo
      const baseValue = 100
      const wave1 = Math.sin((30 - i) * 0.3) * 30
      const wave2 = Math.sin((30 - i) * 0.1) * 15
      const random = (Math.random() - 0.5) * 20
      
      const views = Math.max(0, Math.round(baseValue + wave1 + wave2 + random))
      
      dailyViews.push({
        date: date.toISOString().split('T')[0],
        views,
        portfolioViews: Math.round(views * 0.6),
        testimonialViews: Math.round(views * 0.25),
        careerViews: Math.round(views * 0.15)
      })
    }

    const totalViews = dailyViews.reduce((sum, day) => sum + day.views, 0)
    const portfolioViews = dailyViews.reduce((sum, day) => sum + day.portfolioViews, 0)
    const testimonialViews = dailyViews.reduce((sum, day) => sum + day.testimonialViews, 0)
    const careerViews = dailyViews.reduce((sum, day) => sum + day.careerViews, 0)

    return {
      totalViews,
      portfolioViews,
      testimonialViews,
      careerViews,
      pageViews: Math.round(totalViews * 0.1),
      monthlyGrowth: Math.floor(Math.random() * 20) + 5,
      topPortfolios: [
        { _id: '1', title: 'E-commerce Platform', views: 150, categories: ['Web Development', 'React'] },
        { _id: '2', title: 'Mobile Banking App', views: 120, categories: ['Mobile', 'Fintech'] },
        { _id: '3', title: 'Portfolio Website', views: 90, categories: ['Design', 'Portfolio'] }
      ],
      recentActivity: [
        {
          type: 'create' as const,
          category: 'portfolio' as const,
          itemId: '1',
          itemTitle: 'E-commerce Platform',
          adminId: 'admin',
          description: 'New portfolio project added: E-commerce Platform',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          color: 'green'
        },
        {
          type: 'update' as const,
          category: 'testimonial' as const,
          itemId: '2',
          itemTitle: 'John Doe',
          adminId: 'admin',
          description: 'Updated testimonial: John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          color: 'blue'
        },
        {
          type: 'delete' as const,
          category: 'career' as const,
          itemId: '3',
          itemTitle: 'Old Position',
          adminId: 'admin',
          description: 'Deleted career posting: Old Position',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          color: 'red'
        }
      ] as Array<{
        type: 'create' | 'update' | 'delete'
        category: 'portfolio' | 'testimonial' | 'career'
        itemId: string
        itemTitle: string
        adminId: string
        description: string
        timestamp: string
        color: string
      }>,
      dailyViews,
      monthlyStats: {
        currentMonth: totalViews,
        previousMonth: Math.round(totalViews * 0.8),
        growth: Math.floor(Math.random() * 20) + 5
      }
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance()

// Helper functions for easy usage
export const trackPageView = (page: string) => {
  analyticsService.trackView('page', page)
}

export const trackPortfolioView = (portfolioId: string, portfolioTitle: string) => {
  analyticsService.trackView('portfolio', 'portfolio-detail', portfolioId)
  // Note: portfolioTitle is used for future enhancements
  console.log(`Tracking portfolio view: ${portfolioTitle}`)
}

export const trackTestimonialView = (testimonialId: string) => {
  analyticsService.trackView('testimonial', 'testimonials', testimonialId)
}

export const trackCareerView = (careerId: string) => {
  analyticsService.trackView('career', 'careers', careerId)
}

export const trackAdminActivity = (
  type: ActivityEvent['type'],
  category: ActivityEvent['category'],
  itemId: string,
  itemTitle: string,
  adminId: string,
  details?: Record<string, unknown>
) => {
  analyticsService.trackActivity(type, category, itemId, itemTitle, adminId, details)
}
