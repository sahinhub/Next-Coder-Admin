'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, Eye, Users } from 'lucide-react'

interface AnimatedWaveChartProps {
  data: Array<{
    date: string
    views: number
    portfolioViews?: number
    testimonialViews?: number
    careerViews?: number
  }>
  title?: string
  description?: string
  height?: number
  animated?: boolean
  showStats?: boolean
}

export function AnimatedWaveChart({
  data,
  title = "Analytics Wave",
  description = "Beautiful wave visualization of your data",
  height = 300,
  animated = true,
  showStats = true
}: AnimatedWaveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const [animationTime, setAnimationTime] = useState(0)

  // Generate smooth wave data
  const generateWaveData = () => {
    if (data.length > 0) return data
    
    const days = 30
    const waveData = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Create multiple wave patterns
      const baseValue = 100
      const wave1 = Math.sin((days - i) * 0.3) * 30
      const wave2 = Math.sin((days - i) * 0.1) * 15
      const wave3 = Math.sin((days - i) * 0.05) * 10
      const random = (Math.random() - 0.5) * 20
      
      const views = Math.max(0, Math.round(baseValue + wave1 + wave2 + wave3 + random))
      
      waveData.push({
        date: date.toISOString().split('T')[0],
        views,
        portfolioViews: Math.round(views * 0.6),
        testimonialViews: Math.round(views * 0.25),
        careerViews: Math.round(views * 0.15)
      })
    }
    
    return waveData
  }

  const waveData = generateWaveData()

  // Calculate statistics
  const totalViews = waveData.reduce((sum, item) => sum + item.views, 0)
  const avgViews = Math.round(totalViews / waveData.length)
  const maxViews = Math.max(...waveData.map(item => item.views))
  // const minViews = Math.min(...waveData.map(item => item.views)) // Unused variable

  // Animation loop
  useEffect(() => {
    if (!animated) return

    const animate = () => {
      setAnimationTime(prev => prev + 0.02)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animated])

  // Draw wave on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${height}px`

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Set up wave parameters
    const width = rect.width
    const centerY = height / 2
    const amplitude = height * 0.3
    const frequency = 0.02
    const phase = animated ? animationTime * 0.5 : 0

    // Draw multiple wave layers
    const drawWave = (offset: number, color: string, alpha: number, waveData: number[]) => {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha
      ctx.lineWidth = 2

      for (let x = 0; x < width; x += 2) {
        const progress = x / width
        const dataIndex = Math.floor(progress * (waveData.length - 1))
        const dataValue = waveData[dataIndex] || 0
        
        // Create wave using data + sine wave
        const waveY = centerY + Math.sin(x * frequency + phase + offset) * amplitude * 0.3
        const dataY = centerY - (dataValue / maxViews) * amplitude * 0.7
        const y = waveY + dataY

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
    }

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)')
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.01)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Draw waves
    const views = waveData.map(item => item.views)
    const portfolioViews = waveData.map(item => item.portfolioViews || 0)
    const testimonialViews = waveData.map(item => item.testimonialViews || 0)
    const careerViews = waveData.map(item => item.careerViews || 0)

    // Main wave (total views)
    drawWave(0, '#3B82F6', 0.8, views)
    
    // Portfolio wave
    if (portfolioViews.some(v => v > 0)) {
      drawWave(Math.PI / 3, '#10B981', 0.6, portfolioViews)
    }
    
    // Testimonial wave
    if (testimonialViews.some(v => v > 0)) {
      drawWave(Math.PI / 2, '#F59E0B', 0.6, testimonialViews)
    }
    
    // Career wave
    if (careerViews.some(v => v > 0)) {
      drawWave(Math.PI, '#EF4444', 0.6, careerViews)
    }

    // Draw data points
    ctx.globalAlpha = 1
    ctx.fillStyle = '#3B82F6'
    for (let i = 0; i < waveData.length; i += 3) {
      const x = (i / (waveData.length - 1)) * width
      const progress = i / (waveData.length - 1)
      const dataIndex = Math.floor(progress * (waveData.length - 1))
      const dataValue = (waveData[dataIndex] as {views: number})?.views || 0
      const waveY = centerY + Math.sin(x * frequency + phase) * amplitude * 0.3
      const dataY = centerY - (dataValue / maxViews) * amplitude * 0.7
      const y = waveY + dataY

      ctx.beginPath()
      ctx.arc(x, y, 3, 0, 2 * Math.PI)
      ctx.fill()
    }

  }, [waveData, height, animationTime, animated, maxViews])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()
        
        canvas.width = rect.width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${height}px`
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Wave Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              style={{ height: `${height}px` }}
            />
            
            {/* Overlay stats */}
            {showStats && (
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 space-y-1">
                <div className="flex items-center space-x-2 text-sm">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{totalViews.toLocaleString()}</span>
                  <span className="text-gray-500">total views</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{avgViews}</span>
                  <span className="text-gray-500">avg/day</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{maxViews}</span>
                  <span className="text-gray-500">peak</span>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Total Views</span>
            </div>
            {waveData.some(item => item.portfolioViews && item.portfolioViews > 0) && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Portfolio Views</span>
              </div>
            )}
            {waveData.some(item => item.testimonialViews && item.testimonialViews > 0) && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Testimonial Views</span>
              </div>
            )}
            {waveData.some(item => item.careerViews && item.careerViews > 0) && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Career Views</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
