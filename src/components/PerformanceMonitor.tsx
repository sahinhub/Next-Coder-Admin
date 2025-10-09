'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Monitor LCP
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      if (lastEntry) {
        console.log('LCP:', lastEntry.startTime)
        
        // Log if LCP is above 1.8s
        if (lastEntry.startTime > 1800) {
          console.warn(`LCP is ${lastEntry.startTime}ms - above target of 1.8s`)
        }
      }
    })

    observer.observe({ entryTypes: ['largest-contentful-paint'] })

    // Monitor FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
      
      if (fcpEntry) {
        console.log('FCP:', fcpEntry.startTime)
      }
    })

    fcpObserver.observe({ entryTypes: ['paint'] })

    // Monitor CLS
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      let clsValue = 0
      
      entries.forEach((entry) => {
        const layoutShiftEntry = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
          clsValue += layoutShiftEntry.value
        }
      })
      
      if (clsValue > 0) {
        console.log('CLS:', clsValue)
      }
    })

    clsObserver.observe({ entryTypes: ['layout-shift'] })

    return () => {
      observer.disconnect()
      fcpObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])

  return null
}
