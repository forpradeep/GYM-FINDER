import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { useTheme } from '../context/ThemeContext'
const { theme } = useTheme()

const Favourites = () => {
  const [favs, setFavs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5' }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-8 py-8" style={{ borderBottom: '1px solid #222' }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white">My Favourites</h1>
          <p className="text-gray-400 mt-1">{favs.length} saved gym{favs.length !== 1 ? 's' : ''}</p>
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
            <h2 className="text-2xl font-bold text-white mb-2">No saved gyms yet</h2>
            <p className="text-gray-400 mb-8">Start exploring and save gyms you like</p>
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
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
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
                    <h2 className="text-xl font-bold text-white hover:text-yellow-400 transition-colors mb-1">
                      {fav.gymId.title}
                    </h2>
                  </NavLink>
                  <p className="text-gray-400 text-sm mb-2">📍 {fav.gymId.address}</p>
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
                          style={{ backgroundColor: '#2a2a2a', color: '#D4AF37' }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {fav.gymId.amenities.length > 3 && (
                        <span
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: '#2a2a2a', color: '#888' }}
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