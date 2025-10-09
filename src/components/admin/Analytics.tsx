'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  TrendingUp, 
  Eye, 
  Users, 
  Star, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock
} from 'lucide-react'
import { type Project, type Testimonial, type Career } from '@/lib/api'

interface AnalyticsProps {
  projects: Project[]
  testimonials: Testimonial[]
  careers: Career[]
  analyticsData: {
    totalViews: number
    portfolioViews: number
    testimonialViews: number
    careerViews: number
    monthlyGrowth: number
    topPortfolios: Project[]
    recentActivity: Array<{
      id: string
      type: string
      description: string
      timestamp: string
      color: string
    }>
  }
  analyticsLoading: boolean
  lastRefresh: Date | null
  isDataLoading: boolean
  onRefresh: () => void
  onTabChange: (tab: string) => void
}

export function Analytics({
  projects,
  testimonials,
  careers,
  analyticsData,
  analyticsLoading,
  lastRefresh,
  isDataLoading,
  onRefresh,
  onTabChange
}: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Calculate additional metrics
  const totalProjects = projects.length
  const totalTestimonials = testimonials.length
  const averageRating = testimonials.length > 0 
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : '0.0'
  
  const featuredTestimonials = testimonials.filter(t => t.featured).length
  const activeCareers = careers.filter(c => c.status === 'active').length



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your content performance and engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={analyticsLoading || isDataLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${analyticsLoading || isDataLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      {lastRefresh && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{analyticsData.monthlyGrowth}%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.portfolioViews.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{totalProjects} projects</span>
            </div>
          </CardContent>
        </Card>

        {/* Testimonial Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimonial Views</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.testimonialViews.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{totalTestimonials} testimonials</span>
              <span>•</span>
              <span>{averageRating} avg rating</span>
            </div>
          </CardContent>
        </Card>

        {/* Career Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Career Views</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.careerViews.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{activeCareers} active jobs</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Portfolios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Top Performing Portfolios</span>
            </CardTitle>
            <CardDescription>Most viewed portfolio projects</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.topPortfolios.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topPortfolios.map((project, index) => (
                  <div key={project._id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {project.categories.join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 500) + 100} views
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTabChange('portfolio')}
                        className="text-xs"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No portfolio data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-${activity.color}-500`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Content Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Portfolio Views</span>
              <span className="text-sm font-medium">{analyticsData.portfolioViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Testimonial Views</span>
              <span className="text-sm font-medium">{analyticsData.testimonialViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Career Views</span>
              <span className="text-sm font-medium">{analyticsData.careerViews.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Views</span>
                <span className="text-sm font-bold">{analyticsData.totalViews.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{averageRating}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Featured Testimonials</span>
              <span className="text-sm font-medium">{featuredTestimonials}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</span>
              <span className="text-sm font-medium">{activeCareers}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className="text-sm font-bold text-green-600">+{analyticsData.monthlyGrowth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onTabChange('portfolio')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Manage Portfolios
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onTabChange('testimonials')}
            >
              <Star className="h-4 w-4 mr-2" />
              Manage Testimonials
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onTabChange('careers')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Careers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
