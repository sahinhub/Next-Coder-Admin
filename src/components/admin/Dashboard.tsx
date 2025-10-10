'use client'

import { memo, useMemo } from 'react'
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
  user: {
    username: string
    email: string
    fullName?: string
  } | null
  projects: Project[]
  testimonials: Testimonial[]
  careers: Career[]
  analyticsData: {
    totalViews: number
    portfolioViews: number
    testimonialViews: number
    careerViews: number
    monthlyGrowth: number
  }
  analyticsLoading: boolean
  lastRefresh: Date | null
  isDataLoading: boolean
  onRefresh: () => void
  onTabChange: (tab: string) => void
}

// Memoized stat card component for better performance
const StatCard = memo(({ name, value, change, changeType, icon: Icon, color }: {
  name: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{name}</CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
        {change} from last month
      </p>
    </CardContent>
  </Card>
))

StatCard.displayName = 'StatCard'

export const Dashboard = memo(function Dashboard({
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
  // Memoize expensive calculations
  const recentPortfolios = useMemo(() => projects.slice(0, 3), [projects])
  const recentTestimonials = useMemo(() => testimonials.slice(0, 3), [testimonials])
  const recentCareers = useMemo(() => careers.slice(0, 3), [careers])

  // Memoize stats calculation
  const stats = useMemo(() => [
    { 
      name: 'Total Projects', 
      value: (projects?.length || 0).toString(), 
      change: '+12%', 
      changeType: 'positive' as const, 
      icon: Briefcase, 
      color: 'bg-gradient-to-r from-green-500 to-green-600' 
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
    },
    { 
      name: 'Total Testimonials', 
      value: (testimonials?.length || 0).toString(), 
      change: '+8%', 
      changeType: 'positive' as const, 
      icon: MessageSquare, 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600' 
    }
  ], [projects, careers, testimonials, analyticsData, analyticsLoading])

  return (
    <div className="space-y-3">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Performance</CardTitle>
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {analyticsData.portfolioViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor((analyticsData.portfolioViews / analyticsData.totalViews) * 100)}% of total views
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Testimonial Engagement</CardTitle>
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {analyticsData.testimonialViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor((analyticsData.testimonialViews / analyticsData.totalViews) * 100)}% of total views
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Career Applications</CardTitle>
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {analyticsData.careerViews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Math.floor((analyticsData.careerViews / analyticsData.totalViews) * 100)}% of total views
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Growth Rate</CardTitle>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              +{analyticsData.monthlyGrowth}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Monthly growth rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                  {Array.isArray(portfolio.categories) ? portfolio.categories[0] : portfolio.categories || 'Project'}
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">⭐ {testimonial.rating}/5</p>
                  </div>
                </div>
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
})

Dashboard.displayName = 'Dashboard'
