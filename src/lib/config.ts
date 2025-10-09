/**
 * Application Configuration
 */

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = 'dzvhuak8p'
export const CLOUDINARY_UPLOAD_PRESET = 'wenextcoder_admin' // Your custom upload preset
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

// API Configuration
export const API_BASE_URL = 'https://nextcoderapi.vercel.app'

// Portfolio API Endpoints
export const PORTFOLIO_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/newPortfolio`,
  UPDATE: (id: string) => `${API_BASE_URL}/portfolio/update/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/portfolio/delete/${id}`,
  GET_ALL: `${API_BASE_URL}/portfolios`
}

// Testimonials API Endpoints
export const TESTIMONIAL_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/newTestimonial`,
  UPDATE: (id: string) => `${API_BASE_URL}/testimonial/update/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/testimonial/delete/${id}`,
  GET_ALL: `${API_BASE_URL}/testimonials`
}

// Careers API Endpoints
export const CAREER_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/newCareer`,
  UPDATE: (id: string) => `${API_BASE_URL}/career/update/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/career/delete/${id}`,
  GET_ALL: `${API_BASE_URL}/careers`
}
