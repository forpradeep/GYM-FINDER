import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const OwnerDashboard = () => {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOwnerGyms = async () => {
      try {
        const response = await axiosInstance.get('/gyms/owner')
        setGyms(response.data.gyms)
      } catch (err) {
        setError('Failed to fetch your gyms')
      } finally {
        setLoading(false)
      }
    }
    fetchOwnerGyms()
  }, [])

  const handleDelete = async (gymId) => {
    if (!window.confirm('Are you sure you want to delete this gym?')) return
    try {
      await axiosInstance.delete(`/gyms/${gymId}`)
      setGyms(gyms.filter(gym => gym._id !== gymId))
    } catch (err) {
      setError('Failed to delete gym')
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Header */}
      <div
        className="px-8 py-8"
        style={{ borderBottom: '1px solid #222' }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">My Gyms</h1>
            <p className="text-gray-400 mt-1">{gyms.length} listing{gyms.length !== 1 ? 's' : ''}</p>
          </div>
          <NavLink
            to="/gym/create"
            className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: '#D4AF37' }}
          >
            + Add New Gym
          </NavLink>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {error && (
          <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {gyms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <span className="text-8xl mb-6">🏋️</span>
            <h2 className="text-2xl font-bold text-white mb-2">No gyms listed yet</h2>
            <p className="text-gray-400 mb-8">Start by listing your first gym</p>
            <NavLink
              to="/gym/create"
              className="px-8 py-4 rounded-lg font-bold text-black transition-all hover:opacity-90"
              style={{ backgroundColor: '#D4AF37' }}
            >
              List Your First Gym
            </NavLink>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div
                key={gym._id}
                className="rounded-xl overflow-hidden transition-all hover:scale-105"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
              >
                {/* Image */}
                <NavLink to={`/gym/${gym._id}`}>
                  <div className="h-48 overflow-hidden bg-gray-800">
                    {gym.images?.length > 0 ? (
                      <img
                        src={gym.images[0]}
                        alt={gym.title}
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
                  <NavLink to={`/gym/${gym._id}`}>
                    <h2 className="text-xl font-bold text-white hover:text-yellow-400 transition-colors mb-1">
                      {gym.title}
                    </h2>
                  </NavLink>
                  <p className="text-gray-400 text-sm mb-2">📍 {gym.address}</p>
                  <p className="font-bold mb-3" style={{ color: '#D4AF37' }}>
                    ₹{gym.membershipPrice}/month
                  </p>

                  {/* Amenities */}
                  {gym.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {gym.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ backgroundColor: '#2a2a2a', color: '#D4AF37' }}
                        >
                          {amenity}
                        </span>
                      ))}
                      {gym.amenities.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#2a2a2a', color: '#888' }}>
                          +{gym.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-2">
                    <NavLink
                      to={`/gym/edit/${gym._id}`}
                      className="flex-1 py-2 rounded-lg text-center text-sm font-medium transition-all hover:opacity-80"
                      style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
                    >
                      Edit
                    </NavLink>
                    <button
                      onClick={() => handleDelete(gym._id)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ border: '1px solid #ef4444', color: '#ef4444' }}
                    >
                      Delete
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

export default OwnerDashboard