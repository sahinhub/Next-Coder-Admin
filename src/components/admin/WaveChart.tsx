'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity} from 'lucide-react'

interface WaveChartProps {
  data: Array<{
    date: string
    views: number
    portfolioViews?: number
    testimonialViews?: number
    careerViews?: number
  }>
  title?: string
  height?: number
  showLegend?: boolean
  type?: 'area' | 'line' | 'bar' | 'pie'
  animated?: boolean
}

export function WaveChart({
  data,
  title = "Analytics Overview"}: WaveChartProps) {
  // Calculate totals
  const totalViews = data.reduce((sum, item) => sum + item.views, 0)
  const totalPortfolioViews = data.reduce((sum, item) => sum + (item.portfolioViews || 0), 0)
  const totalTestimonialViews = data.reduce((sum, item) => sum + (item.testimonialViews || 0), 0)
  const totalCareerViews = data.reduce((sum, item) => sum + (item.careerViews || 0), 0)

  // Calculate percentages
  const portfolioPercentage = totalViews > 0 ? Math.round((totalPortfolioViews / totalViews) * 100) : 0
  const testimonialPercentage = totalViews > 0 ? Math.round((totalTestimonialViews / totalViews) * 100) : 0
  const careerPercentage = totalViews > 0 ? Math.round((totalCareerViews / totalViews) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {totalPortfolioViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Portfolio</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalTestimonialViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Testimonials</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalCareerViews.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Careers</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Portfolio Views
                </span>
                <span className="font-medium">{portfolioPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${portfolioPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  Testimonial Views
                </span>
                <span className="font-medium">{testimonialPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${testimonialPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Career Views
                </span>
                <span className="font-medium">{careerPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${careerPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Data Points */}
          {data.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity</h4>
              <div className="space-y-1">
                {data.slice(-5).reverse().map((item, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="font-medium">{item.views.toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
