import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

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

  if (loading) return <p className="text-center p-4">Loading...</p>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Favourites</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {favs.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-gray-500 mb-4">No saved gyms yet.</p>
          <NavLink to="/" className="btn btn-primary">Browse Gyms</NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favs.map((fav) => (
            <div key={fav._id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <NavLink to={`/gym/${fav.gymId._id}`}>
                  <h2 className="card-title hover:underline">{fav.gymId.title}</h2>
                </NavLink>
                <p>{fav.gymId.address}</p>
                <p className="text-sm text-gray-500">₹{fav.gymId.membershipPrice}/month</p>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleRemove(fav.gymId._id)}
                    className="btn btn-sm btn-error"
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
  )
}

export default Favourites