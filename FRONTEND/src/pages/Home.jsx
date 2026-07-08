import { useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Home = () => {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const { isLoggedIn, user } = useSelector((state) => state.auth)

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const url = isLoggedIn && user?.role === 'owner' ? '/gyms/owner' : '/gyms'
        const response = await axiosInstance.get(url);
        setGyms(response.data.gyms);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGyms();
  }, [])

  const handleNearMe = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        setLocationError(null);
        try {
          const response = await axiosInstance.get(`/gyms?lat=${latitude}&lng=${longitude}&radius=5`);
          setGyms(response.data.gyms);
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLocationError("Location access denied. Please enable location permissions.");
      }
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Hero Section */}
      {(!isLoggedIn || user?.role === 'seeker') && (
        <div
          className="relative flex flex-col items-center justify-center text-center py-24 px-4"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            borderBottom: '1px solid #222'
          }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Find Your <span style={{ color: '#D4AF37' }}>Perfect Gym</span>
          </h1>
          <p className="text-gray-400 text-xl mb-10 max-w-xl">
            Discover elite fitness centers near you. Compare amenities, prices, and reviews.
          </p>
          <button
            onClick={handleNearMe}
            className="px-8 py-4 rounded-lg font-bold text-black text-lg transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: '#D4AF37' }}
          >
            📍 Find Gyms Near Me
          </button>
          {locationError && (
            <p className="text-red-400 mt-4 text-sm">{locationError}</p>
          )}
        </div>
      )}

      {/* Owner Header */}
      {isLoggedIn && user?.role === 'owner' && (
        <div className="flex justify-between items-center px-8 py-6" style={{ borderBottom: '1px solid #222' }}>
          <div>
            <h1 className="text-3xl font-bold text-white">My Gyms</h1>
            <p className="text-gray-400 mt-1">Manage your gym listings</p>
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl mb-6">No gyms listed yet.</p>
            {isLoggedIn && user?.role === 'owner' && (
              <NavLink
                to="/gym/create"
                className="px-6 py-3 rounded-lg font-bold text-black"
                style={{ backgroundColor: '#D4AF37' }}
              >
                List Your First Gym
              </NavLink>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <NavLink to={`/gym/${gym._id}`} key={gym._id}>
                <div
                  className="rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  {/* Image */}
                  <div className="h-48 overflow-hidden bg-gray-800">
                    {gym.images?.length > 0 ? (
                      <img
                        src={gym.images[0]}
                        alt={gym.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-5xl">🏋️</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-white mb-1">{gym.title}</h2>
                    <p className="text-gray-400 text-sm mb-3">📍 {gym.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold" style={{ color: '#D4AF37' }}>
                        ₹{gym.membershipPrice}/month
                      </span>
                      {gym.amenities?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {gym.amenities.length} amenities
                        </span>
                      )}
                    </div>
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