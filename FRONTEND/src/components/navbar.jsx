import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import axiosInstance from '../utils/axiosInstance'

const Navbar = () => {
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await axiosInstance.post('/auth/logout');
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div className="navbar bg-base-100 shadow-md px-4">
      <div className="flex-1">
        <NavLink to="/" className="text-xl font-bold">GymFinder</NavLink>
      </div>
      <div className="flex gap-2">
        {!isLoggedIn ? (
          <>
            <NavLink to="/login" className="btn btn-ghost">Login</NavLink>
            <NavLink to="/register" className="btn btn-primary">Register</NavLink>
          </>
        ) : user?.role === 'owner' ? (
          <>
            <NavLink to="/dashboard" className="btn btn-ghost">Dashboard</NavLink>
            <button onClick={handleLogout} className="btn btn-error">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/favourites" className="btn btn-ghost">Favourites</NavLink>
            <button onClick={handleLogout} className="btn btn-error">Logout</button>
          </>
        )}
      </div>
    </div>
  )
}

export default Navbar