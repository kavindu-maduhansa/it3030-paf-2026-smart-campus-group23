import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../services/useAuth'
import { register } from '../services/authService'
import SignInButton from './SignInButton'

const Register = () => {
  const { isAuthenticated, loading, checkAuth } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, loading, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await register(formData)
      await checkAuth()
      navigate('/dashboard')
    } catch (err: any) {
      const data = err.response?.data as Record<string, unknown> | undefined
      if (data && typeof data.message === 'string' && data.message.trim()) {
        setErrors({ general: data.message })
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        const next: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          if (typeof v === 'string') next[k] = v
        }
        if (Object.keys(next).length) {
          setErrors(next)
        } else {
          setErrors({ general: 'Registration failed. Please try again.' })
        }
      } else {
        setErrors({ general: 'Registration failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="ui-auth-shell">
        <div className="text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#3B82F6]"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-[#94A3B8]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ui-auth-shell">
      <div className="ui-auth-card">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-lg shadow-[#3B82F6]/30">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-[#94A3B8]">Sign up to get started</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          {errors.general && (
            <div className="ui-alert-error">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="name" className="ui-auth-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`ui-input px-4 py-3 ${errors.name ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-sm text-[#F87171]">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="ui-auth-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`ui-input px-4 py-3 ${errors.email ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-[#F87171]">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="ui-auth-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`ui-input px-4 py-3 ${errors.password ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-[#F87171]">{errors.password}</p>}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="ui-auth-label"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`ui-input px-4 py-3 ${errors.confirmPassword ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#F87171]">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="ui-button-primary w-full rounded-xl px-6 py-3.5 text-base"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Already have account */}
        <p className="mb-6 text-center text-sm text-[#94A3B8]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#3B82F6] hover:text-[#60A5FA]">
            Sign in
          </Link>
        </p>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1F2937]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#111827] px-4 text-[#64748B]">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <SignInButton fullWidth />

        <p className="mt-6 text-center text-xs text-[#64748B]">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

export default Register
