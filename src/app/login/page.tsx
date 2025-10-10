'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { showSuccessToast } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin-token')
    if (token) {
      // Verify token
      fetch('https://nextcoderapi.vercel.app/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          router.push('/admin')
        }
      })
      .catch(() => {
        localStorage.removeItem('admin-token')
        localStorage.removeItem('admin-user')
      })
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('https://nextcoderapi.vercel.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user data
        localStorage.setItem('admin-token', data.token)
        localStorage.setItem('admin-user', JSON.stringify(data.user))
        
        showSuccessToast(`Welcome back, ${data.user.username}!`)
        
        router.push('/admin')
      } else {
        // Show error toast without throwing console error
        toast.error(data.error || 'Invalid email or password', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: '#ef4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        })
        return
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Show error toast without console error
      toast.error('Invalid email or password', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match. Please try again.', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
      return
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#f59e0b',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('https://nextcoderapi.vercel.app/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user data
        localStorage.setItem('admin-token', data.token)
        localStorage.setItem('admin-user', JSON.stringify(data.user))
        
        showSuccessToast(`Welcome, ${data.user.username}! Your admin account has been created.`, 4000)
        
        router.push('/admin')
      } else {
        // Show error toast without throwing console error
        toast.error(data.error || 'Registration failed', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: '#ef4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        })
        return
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Show error toast without console error
      toast.error('Failed to create account', {
        duration: 4000,
        position: 'bottom-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image 
              src="/We-Next-Coder.png" 
              alt="We Next Coder Logo" 
              width={64}
              height={64}
              className="h-16 w-auto"
              priority
            />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isRegistering ? 'Create Admin Account' : 'Sign in to Admin Panel'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isRegistering ? 'Set up your admin account to manage the website' : 'Access the admin dashboard'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isRegistering ? 'Register' : 'Login'}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegistering ? 'Create your admin account' : 'Enter your credentials to continue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <div >
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      required
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      className="pl-10"
                      placeholder="Enter username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="pl-10"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="pl-10 pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="pl-10 pr-10"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className='space-y-2'>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(true)}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    Don&apos;t have an account? Create one
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}