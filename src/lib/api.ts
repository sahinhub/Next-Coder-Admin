const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nextcoderapi.vercel.app'

// Projects API (Portfolio)
export const projectsApi = {
  // Get all projects
  async getAll(params?: {
    page?: number
    limit?: number
    category?: string
    status?: string
    search?: string
    technologies?: string[]
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.technologies) searchParams.append('technologies', params.technologies.join(','));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const token = localStorage.getItem('admin-token')
    const response = await fetch(`${API_BASE_URL}/portfolios?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`)
    }

    return response.json()
  },

  // Get featured projects
  async getFeatured(limit = 6) {
    const response = await fetch(`${API_BASE_URL}/portfolios`)

    if (!response.ok) {
      throw new Error(`Failed to fetch featured projects: ${response.statusText}`)
    }

    const data = await response.json()
    // Return first few items as featured
    return data.slice(0, limit)
  },

  // Get project by ID
  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/portfolio/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`)
    }

    return response.json()
  },

  // Create new project
  async create(data: Record<string, unknown>) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Creating project with data:', data)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/newPortfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to create project: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Project created successfully:', result)
    return result
  },

  // Update project
  async update(id: string, data: Record<string, unknown>) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Updating project with ID:', id)
    console.log('📝 Update data:', data)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/portfolio/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to update project: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Project updated successfully:', result)
    return result
  },

  // Delete project
  async delete(id: string) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Deleting portfolio with ID:', id)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/portfolio/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to delete portfolio: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Portfolio deleted successfully:', result)
    console.log('📊 Delete result details:', {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
      success: result.acknowledged && result.deletedCount > 0
    })
    return result
  }
}

// Testimonials API
export const testimonialsApi = {
  // Get all testimonials
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const token = localStorage.getItem('admin-token')
    const response = await fetch(`${API_BASE_URL}/testimonials?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch testimonials: ${response.statusText}`)
    }

    return response.json()
  },

  // Get testimonial by ID (Note: API doesn't support getting by ID)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getById(id: string) {
    throw new Error('Get testimonial by ID not implemented in API')
  },

  // Create new testimonial
  async create(data: Record<string, unknown>) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Creating testimonial with data:', data)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to create testimonial: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Testimonial created successfully:', result)
    return result
  },

  // Update testimonial
  async update(id: string, data: Record<string, unknown>) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Updating testimonial with ID:', id)
    console.log('📝 Update data:', data)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/testimonial/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to update testimonial: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Testimonial updated successfully:', result)
    return result
  },

  // Delete testimonial
  async delete(id: string) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Deleting testimonial with ID:', id)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/delete/testimonial/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to delete testimonial: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Testimonial deleted successfully:', result)
    console.log('📊 Delete result details:', {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
      success: result.acknowledged && result.deletedCount > 0
    })
    return result
  }
}

// Careers API
export const careersApi = {
  // Get all careers
  async getAll(params?: {
    page?: number
    limit?: number
    department?: string
    type?: string
    level?: string
    location?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.department) searchParams.append('department', params.department);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.level) searchParams.append('level', params.level);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const token = localStorage.getItem('admin-token')
    const response = await fetch(`${API_BASE_URL}/careers?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch careers: ${response.statusText}`)
    }

    return response.json()
  },

  // Get career by ID
  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/careers/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch career: ${response.statusText}`)
    }

    return response.json()
  },

  // Create new career
  async create(data: Record<string, unknown>) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Creating career with data:', data)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/careers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to create career: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Career created successfully:', result)
    return result
  },

  // Update career
  async update(id: string, data: Record<string, unknown>) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Updating career with ID:', id)
    console.log('📝 Update data:', data)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/career/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data),
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to update career: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Career updated successfully:', result)
    return result
  },

  // Delete career
  async delete(id: string) {
    const token = localStorage.getItem('admin-token')
    
    console.log('🚀 Deleting career with ID:', id)
    console.log('🔑 Using token:', token ? 'Present' : 'Missing')
    
    const response = await fetch(`${API_BASE_URL}/career/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    })

    console.log('📡 API Response status:', response.status)
    console.log('📡 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      let errorMessage = `Failed to delete career: ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('❌ API Error response:', errorData)
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError)
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('✅ Career deleted successfully:', result)
    console.log('📊 Delete result details:', {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
      success: result.acknowledged && result.deletedCount > 0
    })
    return result
  },

  // Get featured careers
  async getFeatured(limit = 6) {
    const response = await fetch(`${API_BASE_URL}/careers`)

    if (!response.ok) {
      throw new Error(`Failed to fetch featured careers: ${response.statusText}`)
    }

    const data = await response.json()
    // Return first few items as featured
    return data.slice(0, limit)
  }
}

// Contact API
export const contactApi = {
  // Get all contacts
  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${API_BASE_URL}/contact?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch contacts: ${response.statusText}`)
    }

    return response.json()
  },

  // Get contact by ID
  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/contact/${id}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch contact: ${response.statusText}`)
    }

    return response.json()
  },

  // Update contact status
  async updateStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/contact/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update contact status: ${response.statusText}`)
    }

    return response.json()
  },

  // Delete contact
  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.statusText}`)
    }

    return response.json()
  }
}

// Analytics API
export const analyticsApi = {
  // Get dashboard stats
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/data`)

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics stats: ${response.statusText}`)
    }

    return response.json()
  },

  // Get real-time stats
  async getRealtimeStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/realtime`)

    if (!response.ok) {
      throw new Error(`Failed to fetch real-time stats: ${response.statusText}`)
    }

    return response.json()
  },

  // Get portfolio analytics (using existing data endpoint)
  async getPortfolioAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/data`)

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio analytics: ${response.statusText}`)
    }

    return response.json()
  },

  // Get testimonial analytics (using existing data endpoint)
  async getTestimonialAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/data`)

    if (!response.ok) {
      throw new Error(`Failed to fetch testimonial analytics: ${response.statusText}`)
    }

    return response.json()
  }
}

// Types
export interface Project {
  _id: string
  title: string
  slug: string
  description: string
  categories: string[]
  technologies: string[]
  features: string[]
  liveUrl?: string
  thumbnail?: string
  images?: string[]
  client?: {
    name?: string
    designation?: string
    testimonial?: string
    image?: string
  }
  publishDate?: string
  status?: 'draft' | 'published'
  createdAt?: string
  updatedAt?: string
}

export interface Testimonial {
  _id: string
  name: string
  rating: number
  review: string
  clientImage?: string
  date?: string
  status?: 'draft' | 'published'
  createdAt?: string
  updatedAt?: string
}

export interface Career {
  _id: string
  title: string
  department: string
  location: string
  experienceRequired: string
  employmentType: string
  description: string
  responsibilities: string[]
  skills: string[]
  postedDate?: string
  applicationDeadline?: string
  status: 'draft' | 'active' | 'paused' | 'closed'
  createdAt?: string
  updatedAt?: string
}

export interface Contact {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: 'new' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  source: 'website' | 'email' | 'phone' | 'referral' | 'other'
  tags: string[]
  assignedTo?: string
  followUpDate?: string
  notes?: Array<{
    note: string
    addedBy?: string
    addedAt: string
  }>
  createdAt: string
  updatedAt: string
}
