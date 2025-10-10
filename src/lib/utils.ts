import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import toast from "react-hot-toast"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function showSuccessToast(message: string, duration: number = 3000) {
  return toast.success(message, {
    duration,
    position: 'bottom-right',
    style: {
      background: document.documentElement.classList.contains('dark') 
        ? '#10b981'  // Green-500 for dark mode
        : '#ffffff',  // White for light mode
      color: document.documentElement.classList.contains('dark')
        ? '#ffffff'  // White text for dark mode
        : '#10b981',  // Green text for light mode
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: document.documentElement.classList.contains('dark')
        ? 'none'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    iconTheme: {
      primary: document.documentElement.classList.contains('dark') ? '#ffffff' : '#10b981',
      secondary: document.documentElement.classList.contains('dark') ? '#10b981' : '#ffffff',
    }
  })
}
