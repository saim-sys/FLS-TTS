'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Mic, Sparkles, Shield, Users } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      console.log('🔄 Attempting login...')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log('📡 Login response:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      console.log('✅ Login successful, saving to localStorage...')
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      
      console.log('✅ Showing success toast...')
      toast.success('Login successful!')
      
      console.log('🔄 Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } catch (error) {
      console.error('❌ Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const onRegister = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Mic className="w-12 h-12 text-primary-600 mr-3" />
              <h1 className="text-5xl font-bold text-gray-900">VoiceGen</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional AI-powered text to speech platform for your community. 
              Transform text into natural-sounding speech with advanced voice synthesis.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Advanced neural networks for natural-sounding speech synthesis</p>
            </div>
            <div className="text-center">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
              <p className="text-gray-600">Exclusive access for community members only</p>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
              <p className="text-gray-600">Built specifically for your paid community</p>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="max-w-md mx-auto">
            <div className="card">
              <div className="flex mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isLogin
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    !isLogin
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Register
                </button>
              </div>

              {isLogin ? (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...loginForm.register('email')}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      {...loginForm.register('password')}
                      className="input-field"
                      placeholder="Enter your password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...registerForm.register('email')}
                      className="input-field"
                      placeholder="Enter your email"
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      {...registerForm.register('username')}
                      className="input-field"
                      placeholder="Choose a username"
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      {...registerForm.register('password')}
                      className="input-field"
                      placeholder="Choose a password"
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
