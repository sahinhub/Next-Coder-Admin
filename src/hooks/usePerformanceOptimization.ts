'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'

// Simple debounced search hook
export function useOptimizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  debounceDelay: number = 300
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceDelay)
    
    return () => clearTimeout(timer)
  }, [searchTerm, debounceDelay])
  
  return useMemo(() => {
    if (!debouncedSearchTerm.trim()) return items || []
    
    return (items || []).filter(item =>
      searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
          )
        }
        return false
      })
    )
  }, [items, debouncedSearchTerm, searchFields])
}

// Simple virtual scrolling hook
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  scrollTop: number
) {
  return useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(start + Math.ceil(containerHeight / itemHeight) + 1, items.length)
    const visibleItems = items.slice(start, end)
    const totalHeight = items.length * itemHeight
    const offsetY = start * itemHeight
    
    return {
      visibleItems,
      totalHeight,
      offsetY,
      startIndex: start,
      endIndex: end
    }
  }, [items, itemHeight, containerHeight, scrollTop])
}

// Simple performance monitoring
export function usePerformanceMonitor() {
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const start = performance.now()
      fn()
      const end = performance.now()
      console.log(`${name} took ${end - start} milliseconds`)
    } else {
      fn()
    }
  }, [])

  const logMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory
      if (memory) {
        console.log('Memory usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`
        })
      }
    }
  }, [])

  return {
    measurePerformance,
    logMemoryUsage
  }
}