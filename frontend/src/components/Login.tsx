import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../services/useAuth'
import { loginWithCredentials } from '../services/authService'
import SignInButton from './SignInButton'

const Login = () => {
  const { isAuthenticated, loading, checkAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await loginWithCredentials({ email, password })
      await checkAuth()
      navigate('/dashboard')
    } catch (err: any) {
      const data = err.response?.data as { message?: string; error?: string } | undefined
      let msg =
        (typeof data?.message === 'string' && data.message.trim() ? data.message : null) ||
        (typeof data?.error === 'string' && data.error.trim() ? data.error : null) ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach the API. Start the backend and restart Vite so the /api proxy matches your port.'
          : null) ||
        'Invalid email or password'
      if (msg === 'An unexpected error occurred') {
        msg =
          'Server error during sign-in. Check the backend terminal log (stack trace). If the account only uses Google, use "Continue with Google" or register with a password.'
      }
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#1F2937] bg-[#111827] p-10 shadow-2xl shadow-black/50">
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">
            Smart Campus
          </h1>
          <p className="text-[#94A3B8]">Sign in to access your dashboard</p>
        </div>

        {/* Email/Password Login Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 text-sm text-[#F87171]">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#CBD5E1] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#CBD5E1] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#3B82F6] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#3B82F6]/30 transition-all hover:bg-[#2563EB] hover:shadow-xl hover:shadow-[#3B82F6]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#111827] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Don't have account */}
        <p className="mb-6 text-center text-sm text-[#94A3B8]">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#3B82F6] hover:text-[#60A5FA]">
            Sign up
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

export default Login
