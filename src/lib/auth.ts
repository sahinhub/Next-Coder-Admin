'use client'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

export const getAdminUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const user = localStorage.getItem('admin_user')
    const token = localStorage.getItem('admin_token')
    
    if (!user || !token) return null
    
    return JSON.parse(user)
  } catch {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('admin_token')
  const user = localStorage.getItem('admin_user')
  
  return !!(token && user)
}

export const logout = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  window.location.href = '/login'
}

export const requireAuth = (): AdminUser | null => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }
  
  return getAdminUser()
}
