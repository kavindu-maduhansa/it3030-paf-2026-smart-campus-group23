import { useAuth } from '../services/useAuth'
import SignInButton from './SignInButton'

interface AuthCheckProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Component that checks authentication status
 * Shows children if authenticated, otherwise shows fallback or sign-in button
 */
const AuthCheck = ({ children, fallback }: AuthCheckProps) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#1F2937] border-t-[#3B82F6]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm text-[#94A3B8]">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        {fallback || (
          <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 text-center shadow-lg shadow-black/30">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3B82F6]/10">
              <svg
                className="h-6 w-6 text-[#3B82F6]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Authentication Required
            </h3>
            <p className="mb-6 text-sm text-[#94A3B8]">
              Please sign in to access this feature
            </p>
            <SignInButton />
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}

export default AuthCheck
