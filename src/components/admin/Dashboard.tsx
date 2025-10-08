'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react'
import { type Project, type Testimonial, type Career } from '@/lib/api'

interface DashboardProps {
  user: any
  projects: Project[]
  testimonials: Testimonial[]
  careers: Career[]
  analyticsData: {
    totalViews: number
    monthlyGrowth: number
  }
  analyticsLoading: boolean
  lastRefresh: Date | null
  isDataLoading: boolean
  onRefresh: () => void
  onTabChange: (tab: string) => void
}

export function Dashboard({
  user,
  projects,
  testimonials,
  careers,
  analyticsData,
  analyticsLoading,
  lastRefresh,
  isDataLoading,
  onRefresh,
  onTabChange
}: DashboardProps) {
  // Recent items for dashboard
  const recentPortfolios = projects.slice(0, 3)
  const recentTestimonials = testimonials.slice(0, 3)
  const recentCareers = careers.slice(0, 3)

  // Stats for dashboard
  const stats = [
    { 
      name: 'Total Projects', 
      value: (projects?.length || 0).toString(), 
      change: '+12%', 
      changeType: 'positive' as const, 
      icon: Briefcase, 
      color: 'bg-gradient-to-r from-green-500 to-green-600' 
    },
    { 
      name: 'Featured Testimonials', 
      value: (testimonials?.filter(t => t.featured)?.length || 0).toString(), 
      change: '+8%', 
      changeType: 'positive' as const, 
      icon: MessageSquare, 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600' 
    },
    { 
      name: 'Active Job Postings', 
      value: (careers?.filter(c => c.status === 'active')?.length || 0).toString(), 
      change: '+5%', 
      changeType: 'positive' as const, 
      icon: Users, 
      color: 'bg-gradient-to-r from-orange-500 to-orange-600' 
    },
    { 
      name: 'Total Views', 
      value: analyticsLoading ? '...' : analyticsData.totalViews.toLocaleString(), 
      change: `+${analyticsData.monthlyGrowth}%`, 
      changeType: 'positive' as const, 
      icon: Eye, 
      color: 'bg-gradient-to-r from-purple-500 to-purple-600' 
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.username || 'Admin'}!</h1>
            <p className="text-green-100">Here&apos;s what&apos;s happening with your content today.</p>
            {lastRefresh && (
              <p className="text-green-200 text-sm mt-2">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isDataLoading}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isDataLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Portfolios */}
        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Portfolios</CardTitle>
            <Button variant="link" className="text-green-600 hover:text-green-700 text-sm font-medium p-0 h-auto" onClick={() => onTabChange('portfolio')}>View all</Button>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {recentPortfolios.map((portfolio) => (
              <div key={portfolio._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{portfolio.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{portfolio.description?.substring(0, 50)}...</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {Array.isArray(portfolio.category) ? portfolio.category[0] : portfolio.category || 'Project'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Testimonials */}
        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Testimonials</CardTitle>
            <Button variant="link" className="text-green-600 hover:text-green-700 text-sm font-medium p-0 h-auto" onClick={() => onTabChange('testimonials')}>View all</Button>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {recentTestimonials.map((testimonial) => (
              <div key={testimonial._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.platform} • ⭐ {testimonial.rating}/5</p>
                  </div>
                </div>
                {testimonial.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Featured
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Careers */}
        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-6">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Recent Job Postings</CardTitle>
            <Button variant="link" className="text-green-600 hover:text-green-700 text-sm font-medium p-0 h-auto" onClick={() => onTabChange('careers')}>View all</Button>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            {recentCareers.map((job) => (
              <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{job.department} • {job.location}</p>
                </div>
                <Badge variant="secondary" className={`${
                  job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  job.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {job.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
