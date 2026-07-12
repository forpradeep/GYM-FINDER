import { useDispatch, useSelector } from 'react-redux'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../store/authSlice'
import axiosInstance from '../utils/axiosInstance'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await axiosInstance.post('/auth/logout');
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div
      className="navbar shadow-md px-6"
      style={{
        borderBottom: theme === 'dark' ? '1px solid #222' : '1px solid #e5e5e5',
        backgroundColor: theme === 'dark' ? '#111' : '#fff'
      }}
    >
      <div className="flex-1">
        <NavLink to="/" className="text-xl font-bold" style={{ color: '#D4AF37' }}>
          GymFinder
        </NavLink>
      </div>

      <div className="flex gap-3 items-center">

        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle">
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {!isLoggedIn ? (
          <>
            <NavLink to="/login" className="btn btn-ghost">Login</NavLink>
            <NavLink
              to="/register"
              className="px-4 py-2 rounded-lg font-bold text-black transition-all hover:opacity-90"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Register
            </NavLink>
          </>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 transition-all hover:opacity-80"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-black text-sm"
                style={{ backgroundColor: '#D4AF37' }}
              >
                {user?.firstName?.[0]?.toUpperCase()}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400 transition-transform"
                style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-12 w-64 rounded-xl overflow-hidden z-50 shadow-2xl"
                style={{
                  backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
                  border: theme === 'dark' ? '1px solid #2a2a2a' : '1px solid #e5e5e5'
                }}
              >
                {/* User Info */}
                <div
                  className="px-4 py-4"
                  style={{ borderBottom: theme === 'dark' ? '1px solid #2a2a2a' : '1px solid #e5e5e5' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-black"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      {user?.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold" style={{ color: theme === 'dark' ? '#fff' : '#111' }}>
                        {user?.firstName}
                      </p>
                      <p className="text-xs text-gray-400">{user?.emailId}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                        style={{
                          backgroundColor: user?.role === 'owner' ? '#1a2a1a' : '#1a1a2a',
                          color: user?.role === 'owner' ? '#22c55e' : '#818cf8',
                          border: `1px solid ${user?.role === 'owner' ? '#22c55e' : '#818cf8'}`
                        }}
                      >
                        {user?.role === 'owner' ? '🏋️ Owner' : '🏃 Seeker'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <NavLink
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    <span>⚙️</span><span>Settings</span>
                  </NavLink>

                  {/* Profile — both roles */}
                  <NavLink
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100"
                    style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                  >
                    <span>👤</span><span>My Profile</span>
                  </NavLink>

                  {user?.role === 'owner' ? (
                    <>
                      <NavLink
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100"
                        style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                      >
                        <span>📊</span><span>Dashboard</span>
                      </NavLink>
                      <NavLink
                        to="/gym/create"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100"
                        style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                      >
                        <span>➕</span><span>Add New Gym</span>
                      </NavLink>
                    </>
                  ) : (
                    <NavLink
                      to="/favourites"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-100"
                      style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}
                    >
                      <span>❤️</span><span>My Favourites</span>
                    </NavLink>
                  )}

                  <div style={{ borderTop: theme === 'dark' ? '1px solid #2a2a2a' : '1px solid #e5e5e5', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:text-red-300 hover:bg-gray-100 transition-colors"
                    >
                      <span>🚪</span><span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar