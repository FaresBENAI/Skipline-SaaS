import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ClientDashboard from './pages/ClientDashboard'
import BusinessDashboard from './pages/BusinessDashboard'
import QRScanner from './pages/QRScanner'
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
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute userType="client">
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business"
        element={
          <ProtectedRoute userType="business">
            <BusinessDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scanner"
        element={
          <ProtectedRoute userType="client">
            <QRScanner />
          </ProtectedRoute>
        }
      />
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
