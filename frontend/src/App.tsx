import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import PageShell from './components/PageShell'
import ResourceList from './components/ResourceList'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import PlaceholderPage from './pages/PlaceholderPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/dashboard"
            element={
              <PageShell>
                <DashboardPage />
              </PageShell>
            }
          />
          <Route
            path="/resources"
            element={
              <PageShell>
                <ResourceList />
              </PageShell>
            }
          />
          <Route
            path="/bookings"
            element={
              <PageShell>
                <PlaceholderPage
                  title="Bookings"
                  description="Booking management and approval workflows will appear here."
                />
              </PageShell>
            }
          />
          <Route
            path="/maintenance"
            element={
              <PageShell>
                <PlaceholderPage
                  title="Maintenance"
                  description="Maintenance tickets and technician communication will appear here."
                />
              </PageShell>
            }
          />
          <Route
            path="/sign-in"
            element={
              <PageShell>
                <PlaceholderPage
                  title="Sign in"
                  description="Google OAuth sign-in will be connected here when authentication is enabled."
                />
              </PageShell>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
