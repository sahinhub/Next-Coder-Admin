import { z } from 'zod'

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
}

// Rate limiting (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

// Validation schemas
export const portfolioValidationSchema = z.object({
  title: z.string().min(1).max(100).transform(sanitizeInput),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).transform(sanitizeInput),
  description: z.string().min(10).max(1000).transform(sanitizeInput),
  categories: z.array(z.string().max(50).transform(sanitizeInput)).min(1).max(10),
  technologies: z.array(z.string().max(50).transform(sanitizeInput)).min(1).max(20),
  features: z.array(z.string().max(100).transform(sanitizeInput)).min(1).max(15),
  liveUrl: z.string().url().optional().or(z.literal('')),
  thumbnail: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).max(10).optional(),
  client: z.object({
    name: z.string().max(100).transform(sanitizeInput),
    designation: z.string().max(100).transform(sanitizeInput),
    testimonial: z.string().max(500).transform(sanitizeInput),
    image: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

export const testimonialValidationSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeInput),
  rating: z.number().min(1).max(5),
  review: z.string().min(10).max(1000).transform(sanitizeInput),
  clientImage: z.string().url().optional().or(z.literal('')),
  date: z.string().optional(),
  platform: z.string().max(50).transform(sanitizeInput).optional(),
  featured: z.boolean().optional(),
})

export const careerValidationSchema = z.object({
  title: z.string().min(1).max(100).transform(sanitizeInput),
  department: z.string().max(100).transform(sanitizeInput),
  location: z.string().max(100).transform(sanitizeInput),
  experienceRequired: z.string().max(50).transform(sanitizeInput),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']),
  description: z.string().min(10).max(2000).transform(sanitizeInput),
  responsibilities: z.array(z.string().max(200).transform(sanitizeInput)).max(20),
  skills: z.array(z.string().max(50).transform(sanitizeInput)).max(30),
  image: z.string().url().optional().or(z.literal('')),
  postedDate: z.string().optional(),
  applicationDeadline: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'closed']).optional(),
})

// API request validation
export function validateApiRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }
    }
    return { success: false, error: 'Invalid input data' }
  }
}
