import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isLoggedIn, user } = useSelector((state) => state.auth)

  if (!isLoggedIn) return <Navigate to="/login" />
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" />
  return children
}

export default ProtectedRoute