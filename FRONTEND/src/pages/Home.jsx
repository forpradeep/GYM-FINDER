import { useEffect, useState } from 'react'
import axiosInstance from '../utils/axiosInstance'
import { NavLink } from 'react-router-dom'

const Home = () => {
  const [gyms, setGyms] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axiosInstance.get('/gyms');
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
      <div className="flex justify-center p-4">
        <button onClick={handleNearMe} className="btn btn-primary">
          📍 Find Gyms Near Me
        </button>
      </div>

      {locationError && (
        <div className="alert alert-error max-w-md mx-auto mb-4">
          <span>{locationError}</span>
        </div>
      )}

      {loading ? <p className="text-center p-4">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {gyms.map((gym) => (
            <NavLink to={`/gym/${gym._id}`} key={gym._id}>
              <div className="card bg-base-100 shadow-md hover:shadow-xl cursor-pointer transition-all">
                <div className="card-body">
                  <h2 className="card-title">{gym.title}</h2>
                  <p>{gym.address}</p>
                  <p className="text-sm text-gray-500">₹{gym.membershipPrice}/month</p>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home