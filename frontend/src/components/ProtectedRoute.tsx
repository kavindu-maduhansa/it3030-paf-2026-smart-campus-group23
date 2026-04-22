import { Navigate } from 'react-router-dom'
import { useAuth } from '../services/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#0F172A] to-[#1E293B]">
        <div className="text-center">
          <div
            className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#1F2937] border-t-[#3B82F6]"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-medium text-[#94A3B8]">
            Checking authentication...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.warn(`[ProtectedRoute] Access denied: Required role ${requiredRole}, but user has ${user?.role}`)
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
