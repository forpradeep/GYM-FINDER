import { useEffect, useState, useRef } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { geocodeAddress, getAddressSuggestions } from '../utils/geocode'
import { useTheme } from '../context/ThemeContext'

const Home = () => {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [radius, setRadius] = useState('10')
  const [heroVisible, setHeroVisible] = useState(false)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const { theme } = useTheme()
  const gymsRef = useRef(null)

  const bg = theme === 'dark' ? '#0a0a0a' : '#f5f5f5'
  const cardBg = theme === 'dark' ? '#1a1a1a' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#2a2a2a' : '#e5e5e5'
  const textPrimary = theme === 'dark' ? '#ffffff' : '#111111'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
  const inputBg = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const inputBorder = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100)
    const fetchGyms = async () => {
      try {
        const url = isLoggedIn && user?.role === 'owner' ? '/gyms/owner' : '/gyms'
        const response = await axiosInstance.get(url)
        setGyms(response.data.gyms)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchGyms()
  }, [])

  const handleNearMe = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLoading(true)
        setLocationError(null)
        try {
          const response = await axiosInstance.get(`/gyms?lat=${latitude}&lng=${longitude}&radius=${radius}`)
          setGyms(response.data.gyms)
          gymsRef.current?.scrollIntoView({ behavior: 'smooth' })
        } catch (err) {
          console.log(err)
        } finally {
          setLoading(false)
        }
      },
      () => setLocationError("Location access denied.")
    )
  }

  const handleSearchInput = async (e) => {
    const value = e.target.value
    setSearchAddress(value)
    if (value.length > 2) {
      const results = await getAddressSuggestions(value)
      setSuggestions(results)
      setShowSuggestions(true)
      try {
        const response = await axiosInstance.get(`/gyms?search=${value}`)
        setGyms(response.data.gyms)
      } catch (err) { console.log(err) }
    } else if (value.length === 0) {
      setShowSuggestions(false)
      const response = await axiosInstance.get('/gyms')
      setGyms(response.data.gyms)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = async (suggestion) => {
    setSearchAddress(suggestion.label)
    setShowSuggestions(false)
    setLoading(true)
    setLocationError(null)
    try {
      const response = await axiosInstance.get(`/gyms?lat=${suggestion.lat}&lng=${suggestion.lng}&radius=${radius}`)
      setGyms(response.data.gyms)
      gymsRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      setLocationError('Failed to find gyms')
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSearch = async () => {
    if (!searchAddress) return
    setSearchLoading(true)
    setLocationError(null)
    try {
      const { lat, lng } = await geocodeAddress(searchAddress)
      const response = await axiosInstance.get(`/gyms?lat=${lat}&lng=${lng}&radius=${radius}`)
      setGyms(response.data.gyms)
      gymsRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      setLocationError('Address not found. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

      {/* Hero Section — Seeker / Not logged in */}
      {(!isLoggedIn || user?.role === 'seeker') && (
        <div
          className="relative flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            minHeight: '100vh',
            background: theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 0%, #2a1a00 0%, #1a0f00 30%, #0a0a0a 70%)'
              : 'radial-gradient(ellipse at 50% 0%, #fff8e1 0%, #fdf6d8 30%, #f5f5f5 70%)'
          }}
        >
          {/* Animated background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: '#D4AF37' }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: '#D4AF37' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: '#ff8c00' }}
          />

          {/* Content */}
          <div
            className="relative z-10 px-6 flex flex-col items-center"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s ease, transform 0.8s ease'
            }}
          >
            {/* Badge */}
            <div
              className="px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase"
              style={{
                backgroundColor: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#D4AF37'
              }}
            >
              ✦ India's Premium Gym Discovery Platform
            </div>

            {/* Heading */}
            <h1
              className="text-6xl md:text-7xl font-bold mb-4 leading-tight"
              style={{ color: textPrimary }}
            >
              Find Your
              <br />
              <span
                style={{
                  color: '#D4AF37',
                  textShadow: '0 0 40px rgba(212,175,55,0.4)'
                }}
              >
                Perfect Gym
              </span>
            </h1>

            <p className="text-xl mb-4 max-w-xl" style={{ color: textSecondary }}>
              Discover elite fitness centers near you. Compare amenities, prices, and real reviews.
            </p>

            {/* Stats */}
            <div className="flex gap-8 mb-10">
              {[
                { value: `${gyms.length}+`, label: 'Gyms Listed' },
                { value: '100%', label: 'Verified' },
                { value: '24/7', label: 'Support' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: textSecondary }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl relative">
              <div
                className="flex gap-2 p-2 rounded-2xl"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: '1px solid rgba(212,175,55,0.3)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <input
                  type="text"
                  placeholder="Search by area, city or address..."
                  value={searchAddress}
                  onChange={handleSearchInput}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="flex-1 px-4 py-3 rounded-xl text-lg focus:outline-none"
                  style={{
                    backgroundColor: 'transparent',
                    color: textPrimary,
                  }}
                />
                <select
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={{
                    backgroundColor: 'rgba(212,175,55,0.1)',
                    borderColor: 'transparent',
                    color: '#D4AF37'
                  }}
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                  <option value="50">50 km</option>
                </select>
                <button
                  onClick={handleAddressSearch}
                  disabled={searchLoading}
                  className="px-6 py-3 rounded-xl font-bold text-black transition-all hover:opacity-90 hover:scale-105"
                  style={{ backgroundColor: '#D4AF37' }}
                >
                  {searchLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : '🔍'}
                </button>
              </div>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-16 left-0 right-0 rounded-xl overflow-hidden z-50 shadow-2xl"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
                    border: '1px solid rgba(212,175,55,0.3)'
                  }}
                >
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 transition-colors text-sm hover:bg-yellow-500 hover:bg-opacity-10"
                      style={{
                        color: textPrimary,
                        borderBottom: i < suggestions.length - 1 ? `1px solid ${cardBorder}` : 'none'
                      }}
                    >
                      📍 {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5 w-full max-w-2xl">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,175,55,0.2)' }}></div>
              <span className="text-sm" style={{ color: textSecondary }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(212,175,55,0.2)' }}></div>
            </div>

            {/* Location Button */}
            <button
              onClick={handleNearMe}
              className="flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-black transition-all hover:opacity-90 hover:scale-105"
              style={{
                backgroundColor: '#D4AF37',
                boxShadow: '0 0 30px rgba(212,175,55,0.3)'
              }}
            >
              <span className="text-xl">📍</span>
              Use My Current Location
            </button>

            {locationError && gyms.length === 0 && (
              <p className="text-red-400 mt-4 text-sm">{locationError}</p>
            )}

            {/* Scroll hint */}
            <div
              className="mt-16 flex flex-col items-center animate-bounce"
              style={{ color: textSecondary }}
            >
              <p className="text-xs mb-2 tracking-widest uppercase">Explore Gyms</p>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Owner Header */}
      {isLoggedIn && user?.role === 'owner' && (
        <div
          className="flex justify-between items-center px-8 py-6"
          style={{ borderBottom: `1px solid ${cardBorder}`, backgroundColor: bg }}
        >
          <div>
            <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>My Gyms</h1>
            <p className="mt-1" style={{ color: textSecondary }}>Manage your gym listings</p>
          </div>
          <NavLink
            to="/gym/create"
            className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
            style={{ backgroundColor: '#D4AF37' }}
          >
            + Add New Gym
          </NavLink>
        </div>
      )}

      {/* Gym Grid */}
      <div ref={gymsRef} className="max-w-7xl mx-auto px-6 py-16">

        {(!isLoggedIn || user?.role === 'seeker') && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: textPrimary }}>
              {searchAddress ? `Results for "${searchAddress}"` : 'All Gyms'}
            </h2>
            <p className="text-sm" style={{ color: textSecondary }}>{gyms.length} gyms found</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl mb-6" style={{ color: textSecondary }}>No gyms found in this area.</p>
            <button
              onClick={() => {
                setSearchAddress('')
                setLocationError(null)
                setLoading(true)
                axiosInstance.get('/gyms').then(r => setGyms(r.data.gyms)).finally(() => setLoading(false))
              }}
              className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-80"
              style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
            >
              Show All Gyms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <NavLink to={`/gym/${gym._id}`} key={gym._id}>
                <div
                  className="rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl cursor-pointer group"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <div className="h-52 overflow-hidden relative" style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5' }}>
                    {gym.images?.length > 0 ? (
                      <>
                        <img
                          src={gym.images[0]}
                          alt={gym.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: theme === 'dark'
                            ? 'linear-gradient(135deg, #1a1a1a, #2a2a2a)'
                            : 'linear-gradient(135deg, #e5e5e5, #f0f0f0)'
                        }}
                      >
                        <span className="text-6xl opacity-50">🏋️</span>
                      </div>
                    )}

                    {/* Price tag overlay */}
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-black"
                      style={{ backgroundColor: '#D4AF37' }}
                    >
                      ₹{gym.membershipPrice}/mo
                    </div>
                  </div>

                  <div className="p-5">
                    <h2 className="text-xl font-bold mb-1 group-hover:text-yellow-400 transition-colors" style={{ color: textPrimary }}>
                      {gym.title}
                    </h2>
                    <p className="text-sm mb-3" style={{ color: textSecondary }}>📍 {gym.address}</p>

                    {gym.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {gym.amenities.slice(0, 3).map((amenity, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                              color: '#D4AF37'
                            }}
                          >
                            {amenity}
                          </span>
                        ))}
                        {gym.amenities.length > 3 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{
                              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                              color: textSecondary
                            }}
                          >
                            +{gym.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home