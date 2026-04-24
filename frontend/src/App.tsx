import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from './services/AuthProvider'
import Layout from './components/Layout'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import PageShell from './components/PageShell'
import ResourceList from './components/ResourceList'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import ProfilePage from './pages/ProfilePage'
import AdminUsersPage from './pages/AdminUsersPage'
import SchedulePage from './pages/SchedulePage'
import BookingsPage from './pages/BookingsPage'
import BookingPassPage from './pages/BookingPassPage'
import MaintenancePage from './pages/MaintenancePage'
import MaintenanceSupportPage from './pages/MaintenanceSupportPage'
import SupportPage from './pages/SupportPage'
import TechnicianDashboardPage from './pages/TechnicianDashboardPage'
import TechnicianAlertsPage from './pages/TechnicianAlertsPage'
import TermsPage from './pages/TermsPage'
import { AnalyticsDashboard } from './components/AnalyticsDashboard'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111827',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '12px',
          },
          success: {
            style: {
              border: '1px solid rgba(16, 185, 129, 0.35)',
              background: 'rgba(16, 185, 129, 0.1)',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#0F172A',
            },
          },
          error: {
            style: {
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.12)',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#0F172A',
            },
          },
        }}
      />
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/booking-pass" element={<BookingPassPage />} />
            {/* Redirect /sign-in to /login for compatibility */}
            <Route path="/sign-in" element={<Navigate to="/login" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <DashboardPage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/dashboard"
              element={
                <ProtectedRoute requiredRole="TECHNICIAN">
                  <PageShell>
                    <TechnicianDashboardPage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/technician/alerts"
              element={
                <ProtectedRoute requiredRole="TECHNICIAN">
                  <PageShell>
                    <TechnicianAlertsPage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <ProfilePage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <AdminUsersPage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <SchedulePage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <ResourceList />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <BookingsPage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <MaintenancePage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/report"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <MaintenanceSupportPage />
                  </PageShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <PageShell>
                    <AnalyticsDashboard />
                  </PageShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
