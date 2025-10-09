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

    const response = await fetch(`${API_BASE_URL}/portfolios?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`)
    }

    return response.json()
  },

  // Get featured projects
  async getFeatured(limit = 6) {
    const response = await fetch(`${API_BASE_URL}/portfolios/featured/list?limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch featured projects: ${response.statusText}`)
    }

    return response.json()
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
    const response = await fetch(`${API_BASE_URL}/newPortfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create project: ${response.statusText}`)
    }

    return response.json()
  },

  // Update project (Note: API doesn't support updates, only create/delete)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: string, data: Record<string, unknown>) {
    // For now, we'll throw an error since the API doesn't support updates
    throw new Error('Update functionality not implemented in API')
  },

  // Delete project
  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/portfolio/delete/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete project: ${response.statusText}`)
    }

    return response.json()
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

    const response = await fetch(`${API_BASE_URL}/testimonials?${searchParams.toString()}`)

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

  // Create new testimonial (Note: API doesn't support creating testimonials)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(data: Record<string, unknown>) {
    throw new Error('Create testimonial not implemented in API')
  },

  // Update testimonial (Note: API doesn't support updating testimonials)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: string, data: Record<string, unknown>) {
    throw new Error('Update testimonial not implemented in API')
  },

  // Delete testimonial
  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/delete/testimonial/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete testimonial: ${response.statusText}`)
    }

    return response.json()
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

    const response = await fetch(`${API_BASE_URL}/careers?${searchParams.toString()}`)

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
    const response = await fetch(`${API_BASE_URL}/careers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create career: ${response.statusText}`)
    }

    return response.json()
  },

  // Update career (Note: API doesn't support updating careers)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(id: string, data: Record<string, unknown>) {
    throw new Error('Update career not implemented in API')
  },

  // Delete career
  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/career/delete/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete career: ${response.statusText}`)
    }

    return response.json()
  },

  // Get featured careers
  async getFeatured(limit = 6) {
    const response = await fetch(`${API_BASE_URL}/careers/featured/list?limit=${limit}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch featured careers: ${response.statusText}`)
    }

    return response.json()
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
    const response = await fetch(`${API_BASE_URL}/analytics/stats`)

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics stats: ${response.statusText}`)
    }

    return response.json()
  },

  // Get portfolio analytics
  async getPortfolioAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/portfolio`)

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio analytics: ${response.statusText}`)
    }

    return response.json()
  },

  // Get testimonial analytics
  async getTestimonialAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/testimonials`)

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
  createdAt?: string
  updatedAt?: string
}

export interface Testimonial {
  _id: string
  name: string
  rating: number
  review: string
  platform: string
  featured: boolean
  date?: string
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
  status: 'active' | 'paused' | 'closed'
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
