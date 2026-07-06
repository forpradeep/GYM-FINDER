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

  if (loading) return <p className="text-center p-4">Loading...</p>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Gyms</h1>
        <NavLink to="/gym/create" className="btn btn-primary">
          + Add New Gym
        </NavLink>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {gyms.length === 0 ? (
        <div className="text-center p-10">
          <p className="text-gray-500 mb-4">You haven't listed any gyms yet.</p>
          <NavLink to="/gym/create" className="btn btn-primary">
            List Your First Gym
          </NavLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gyms.map((gym) => (
            <NavLink to={`/gym/${gym._id}`} key={gym._id}>
              <div className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-all">
                <div className="card-body">
                  <h2 className="card-title">{gym.title}</h2>
                  <p>{gym.address}</p>
                  <p className="text-sm text-gray-500">₹{gym.membershipPrice}/month</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {gym.amenities?.map((amenity, i) => (
                      <span key={i} className="badge badge-outline badge-sm">{amenity}</span>
                    ))}
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <NavLink
                      to={`/gym/edit/${gym._id}`}
                      className="btn btn-sm btn-outline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </NavLink>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(gym._id) }}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default OwnerDashboard