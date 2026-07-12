import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { useTheme } from '../context/ThemeContext'


const Favourites = () => {
  const { theme } = useTheme()
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const bg = theme === 'dark' ? '#0f0005' : '#fff0f5'
  const surface = theme === 'dark' ? '#2a0015' : '#ffffff'  // ← brighter card
  const border = theme === 'dark' ? '#5a0030' : '#ffd0e0'   // ← more visible border
  const textPrimary = theme === 'dark' ? '#f8fafc' : '#0f172a'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#64748b'
  const chipBg = theme === 'dark' ? '#1f2937' : '#e2e8f0'
  const chipText = theme === 'dark' ? '#fbbf24' : '#1d4ed8'

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const response = await axiosInstance.get('/favourites')
        setFavs(response.data.favs)
      } catch (err) {
        setError('Failed to fetch favourites')
      } finally {
        setLoading(false)
      }
    }
    fetchFavourites()
  }, [])

  const handleRemove = async (gymId) => {
    try {
      await axiosInstance.delete(`/favourites/${gymId}`)
      setFavs(favs.filter(fav => fav.gymId._id !== gymId))
    } catch (err) {
      setError('Failed to remove from favourites')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: bg }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', color: textPrimary }}>

      {/* Header */}
      <div className="px-8 py-8" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>My Favourites</h1>
          <p className="mt-1" style={{ color: textSecondary }}>{favs.length} saved gym{favs.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {error && (
          <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {favs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <span className="text-8xl mb-6">🤍</span>
            <h2 className="text-2xl font-bold mb-2" style={{ color: textPrimary }}>No saved gyms yet</h2>
            <p className="mb-8" style={{ color: textSecondary }}>Start exploring and save gyms you like</p>
            <NavLink
              to="/"
              className="px-8 py-4 rounded-lg font-bold text-black transition-all hover:opacity-90"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Browse Gyms
            </NavLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favs.map((fav) => (
              <div
                key={fav._id}
                className="rounded-xl overflow-hidden transition-all hover:scale-105"
                style={{ backgroundColor: surface, border: `1px solid ${border}` }}
              >
                {/* Image */}
                <NavLink to={`/gym/${fav.gymId._id}`}>
                  <div className="h-48 overflow-hidden bg-gray-800">
                    {fav.gymId.images?.length > 0 ? (
                      <img
                        src={fav.gymId.images[0]}
                        alt={fav.gymId.title}
                        className="w-full h-full object-cover hover:scale-110 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">🏋️</span>
                      </div>
                    )}
                  </div>
                </NavLink>

                {/* Info */}
                <div className="p-5">
                  <NavLink to={`/gym/${fav.gymId._id}`}>
                    <h2 className="text-xl font-bold transition-colors mb-1" style={{ color: textPrimary }}>
                      {fav.gymId.title}
                    </h2>
                  </NavLink>
                  <p className="text-sm mb-2" style={{ color: textSecondary }}>📍 {fav.gymId.address}</p>
                  <p className="font-bold mb-4" style={{ color: '#D4AF37' }}>
                    ₹{fav.gymId.membershipPrice}/month
                  </p>

                  {/* Amenities */}
                  {fav.gymId.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {fav.gymId.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: chipBg, color: chipText }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {fav.gymId.amenities.length > 3 && (
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: chipBg, color: textSecondary }}
                        >
                          +{fav.gymId.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <NavLink
                      to={`/gym/${fav.gymId._id}`}
                      className="flex-1 py-2 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80"
                      style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
                    >
                      View Details
                    </NavLink>
                    <button
                      onClick={() => handleRemove(fav.gymId._id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ border: '1px solid #ef4444', color: '#ef4444' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favourites