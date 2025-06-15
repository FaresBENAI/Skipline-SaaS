import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ClientDashboard from './pages/ClientDashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import QueueManagement from './pages/QueueManagement'
import ClientProfile from './pages/ClientProfile'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import JoinQueue from './pages/JoinQueue'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

const AppRoutes = () => {
  const { user } = useAuth()
  
  const getDashboardRoute = () => {
    if (!user) return '/auth'
    const userType = user.user_metadata?.user_type
    if (userType === 'business') return '/business'
    if (userType === 'client') return '/dashboard'
    return '/auth'
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/auth"
        element={user ? <Navigate to={getDashboardRoute()} replace /> : <AuthPage />}
      />
      
      {/* Routes Client */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute userType="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute userType="client">
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute userType="client">
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute userType="client">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
                <p className="text-gray-600">Page à venir...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      {/* Routes Business */}
      <Route
        path="/business"
        element={
          <ProtectedRoute userType="business">
            <BusinessDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/queue/:queueId"
        element={
          <ProtectedRoute userType="business">
            <QueueManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/profile"
        element={
          <ProtectedRoute userType="business">
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/settings"
        element={
          <ProtectedRoute userType="business">
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business/notifications"
        element={
          <ProtectedRoute userType="business">
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
                <p className="text-gray-600">Page à venir...</p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
      
      {/* Route scan client par entreprise */}
      <Route
        path="/client/:userId"
        element={
          <ProtectedRoute userType="business">
            <ClientProfile />
          </ProtectedRoute>
        }
      />
      
      {/* Route publique d'inscription */}
      <Route
        path="/join/:companyCode"
        element={<JoinQueue />}
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
