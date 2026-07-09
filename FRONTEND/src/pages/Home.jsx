import { useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { geocodeAddress, getAddressSuggestions } from '../utils/geocode'

const Home = () => {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)
  const [searchAddress, setSearchAddress] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [radius, setRadius] = useState('10')
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
          const response = await axiosInstance.get(`/gyms?lat=${latitude}&lng=${longitude}&radius=${radius}`);
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

  const handleSearchInput = async (e) => {
    const value = e.target.value
    setSearchAddress(value)
    
    if (value.length > 2) {
        // show autocomplete suggestions
        const results = await getAddressSuggestions(value)
        setSuggestions(results)
        setShowSuggestions(true)
        
        // also search gyms by text
        try {
            const response = await axiosInstance.get(`/gyms?search=${value}`)
            setGyms(response.data.gyms)
        } catch (err) {
            console.log(err)
        }
    } else if (value.length === 0) {
        // reset to all gyms
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
    } catch (err) {
      setLocationError('Address not found. Please try again.')
    } finally {
      setSearchLoading(false)
    }
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

          {/* Search Bar with Autocomplete */}
          <div className="flex flex-col w-full max-w-lg mb-4 relative">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter area, city or address..."
                value={searchAddress}
                onChange={handleSearchInput}
                onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="flex-1 px-4 py-3 rounded-lg text-white placeholder-gray-500 border focus:outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
              />
              <button
                onClick={handleAddressSearch}
                disabled={searchLoading}
                className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4AF37' }}
              >
                {searchLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : '🔍'}
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-14 left-0 right-12 rounded-lg overflow-hidden z-50"
                style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
              >
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                    style={{ borderBottom: i < suggestions.length - 1 ? '1px solid #2a2a2a' : 'none' }}
                  >
                    📍 {suggestion.label}
                  </button>
                ))}
              </div>
            )}

            {/* Radius Selector */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="text-gray-400 text-sm">Search radius:</span>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="px-3 py-1 rounded-lg text-white text-sm border focus:outline-none"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#333' }}
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-16" style={{ backgroundColor: '#333' }}></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="h-px w-16" style={{ backgroundColor: '#333' }}></div>
          </div>

          <button
            onClick={handleNearMe}
            className="px-8 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: '#D4AF37' }}
          >
            📍 Use My Current Location
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
            <p className="text-gray-500 text-xl mb-6">No gyms found in this area.</p>
            <button
              onClick={() => {
                setSearchAddress('')
                setLocationError(null)
                setLoading(true)
                axiosInstance.get('/gyms').then(r => setGyms(r.data.gyms)).finally(() => setLoading(false))
              }}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-80"
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
                  className="rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
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