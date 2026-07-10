import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
const { theme } = useTheme()

const gymSchema = z.object({
  title: z.string().min(3, "Minimum 3 characters").max(50, "Maximum 50 characters"),
  address: z.string().min(3, "Address too short").max(200, "Address too long"),
  emailId: z.string().email("Invalid email"),
  contact: z.string().min(10, "Invalid contact number"),
  membershipPrice: z.string().min(1, "Price is required"),
})

const AMENITIES = ['Parking', 'Locker', 'Trainer', 'Sauna', 'Pool', 'Cardio', 'Weights', 'Yoga']

const EditGym = () => {
  const { id } = useParams()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState(null)
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imageLoading, setImageLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState([])
  const navigate = useNavigate()

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(gymSchema)
  })

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const response = await axiosInstance.get(`/gyms/${id}`)
        const gym = response.data.gym
        reset({
          title: gym.title,
          address: gym.address,
          emailId: gym.emailId,
          contact: String(gym.contact),
          membershipPrice: String(gym.membershipPrice),
        })
        setSelectedAmenities(gym.amenities || [])
        setImages(gym.images || [])
        setImagePreview(gym.images || [])
        if (gym.location?.coordinates) {
          setLocation({
            lat: gym.location.coordinates[1],
            lng: gym.location.coordinates[0]
          })
        }
      } catch (err) {
        setError('Failed to fetch gym details')
      } finally {
        setLoading(false)
      }
    }
    fetchGym()
  }, [id])

  const handleGetLocation = () => {
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationLoading(false)
      },
      () => {
        setError("Location access denied")
        setLocationLoading(false)
      }
    )
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setImageLoading(true)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('images', file))
      const response = await axios.post('http://localhost:3000/api/gyms/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setImages(response.data.urls)
      setImagePreview(files.map(file => URL.createObjectURL(file)))
    } catch (err) {
      setError('Image upload failed')
    } finally {
      setImageLoading(false)
    }
  }

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const onSubmit = async (data) => {
    try {
      setError(null)
      await axiosInstance.put(`/gyms/${id}`, {
        ...data,
        amenities: selectedAmenities,
        images,
        ...(location && { lat: location.lat, lng: location.lng })
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Failed to update gym')
    }
  }

  const inputStyle = {
    backgroundColor: '#1a1a1a',
    borderColor: '#333',
    color: 'white'
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white">Edit Gym</h1>
          <p className="text-gray-400 mt-1">Update your gym details</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">

        {error && (
          <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gym Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : '#333' }}
              {...register('title')}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{ ...inputStyle, borderColor: errors.address ? '#ef4444' : '#333' }}
              {...register('address')}
            />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
          </div>

          {/* Email + Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gym Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                style={{ ...inputStyle, borderColor: errors.emailId ? '#ef4444' : '#333' }}
                {...register('emailId')}
              />
              {errors.emailId && <p className="text-red-400 text-sm mt-1">{errors.emailId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
                style={{ ...inputStyle, borderColor: errors.contact ? '#ef4444' : '#333' }}
                {...register('contact')}
              />
              {errors.contact && <p className="text-red-400 text-sm mt-1">{errors.contact.message}</p>}
            </div>
          </div>

          {/* Membership Price */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Membership Price (₹/month)</label>
            <input
              type="number"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-all"
              style={{ ...inputStyle, borderColor: errors.membershipPrice ? '#ef4444' : '#333' }}
              {...register('membershipPrice')}
            />
            {errors.membershipPrice && <p className="text-red-400 text-sm mt-1">{errors.membershipPrice.message}</p>}
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Amenities</label>
            <div className="flex flex-wrap gap-3">
              {AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedAmenities.includes(amenity) ? '#D4AF37' : '#1a1a1a',
                    color: selectedAmenities.includes(amenity) ? '#000' : '#D4AF37',
                    border: '1px solid #D4AF37'
                  }}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gym Images</label>
            {imagePreview.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {imagePreview.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="h-20 w-20 object-cover rounded-lg"
                    style={{ border: '1px solid #D4AF37' }}
                  />
                ))}
              </div>
            )}
            <label
              className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-yellow-500"
              style={{ borderColor: '#333', backgroundColor: '#1a1a1a' }}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl mb-1">📸</span>
                <p className="text-gray-400 text-sm">Click to update gym photos</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            {imageLoading && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">Uploading images...</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gym Location</label>
            <button
              type="button"
              onClick={handleGetLocation}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: location ? '#1a2a1a' : '#1a1a1a',
                border: `1px solid ${location ? '#22c55e' : '#333'}`,
                color: location ? '#22c55e' : '#D4AF37'
              }}
            >
              {locationLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  Getting location...
                </span>
              ) : location ? (
                '📍 Location Set ✅'
              ) : (
                '📍 Update Location'
              )}
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 py-4 rounded-lg font-bold text-black text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-4 rounded-lg font-bold transition-all hover:opacity-80"
              style={{ border: '1px solid #333', color: '#888' }}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditGym