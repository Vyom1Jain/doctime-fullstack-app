import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    const defaultPath = user.role === 'PATIENT' ? '/patient/dashboard' : '/doctor/dashboard'
    return <Navigate to={defaultPath} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
