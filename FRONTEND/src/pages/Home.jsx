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
      (error) => {
        setLocationError("Location access denied. Please enable location permissions.");
      }
    );
  }

  return (
    <div>
      {/* Hide near me button for owners */}
      {(!isLoggedIn || user?.role === 'seeker') && (
        <div className="flex justify-center p-4">
          <button onClick={handleNearMe} className="btn btn-primary">
            📍 Find Gyms Near Me
          </button>
        </div>
      )}

      {locationError && (
        <div className="alert alert-error max-w-md mx-auto mb-4">
          <span>{locationError}</span>
        </div>
      )}

      {loading ? <p className="text-center p-4">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {gyms.length === 0 ? (
            <div className="col-span-3 text-center p-10">
              <p className="text-gray-500 mb-4">No gyms listed yet.</p>
              {isLoggedIn && user?.role === 'owner' && (
                <NavLink to="/gym/create" className="btn btn-primary">
                  List Your First Gym
                </NavLink>
              )}
            </div>
          ) : (
            gyms.map((gym) => (
              <NavLink to={`/gym/${gym._id}`} key={gym._id}>
                <div className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-all">
                  {gym.images?.length > 0 && (
                    <figure>
                      <img src={gym.images[0]} alt={gym.title} className="h-48 w-full object-cover" />
                    </figure>
                  )}
                  <div className="card-body">
                    <h2 className="card-title">{gym.title}</h2>
                    <p>{gym.address}</p>
                    <p className="text-sm text-gray-500">₹{gym.membershipPrice}/month</p>
                  </div>
                </div>
              </NavLink>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Home