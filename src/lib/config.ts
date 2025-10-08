/**
 * Application Configuration
 */

// ImageBB API Configuration
export const IMAGEBB_API_KEY = 'f98ae7b402df230d1049fedaaf05d9cf'
export const IMAGEBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

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
