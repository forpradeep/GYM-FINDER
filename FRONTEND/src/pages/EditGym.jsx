import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import axios from 'axios'

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

  if (loading) return <p className="text-center p-4">Loading...</p>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Gym</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Title */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Name</span></label>
          <input type="text" className={`input input-bordered ${errors.title ? 'input-error' : ''}`} {...register('title')} />
          {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
        </div>

        {/* Address */}
        <div className="form-control">
          <label className="label"><span className="label-text">Address</span></label>
          <input type="text" className={`input input-bordered ${errors.address ? 'input-error' : ''}`} {...register('address')} />
          {errors.address && <span className="text-error text-sm mt-1">{errors.address.message}</span>}
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Email</span></label>
          <input type="email" className={`input input-bordered ${errors.emailId ? 'input-error' : ''}`} {...register('emailId')} />
          {errors.emailId && <span className="text-error text-sm mt-1">{errors.emailId.message}</span>}
        </div>

        {/* Contact */}
        <div className="form-control">
          <label className="label"><span className="label-text">Contact Number</span></label>
          <input type="text" className={`input input-bordered ${errors.contact ? 'input-error' : ''}`} {...register('contact')} />
          {errors.contact && <span className="text-error text-sm mt-1">{errors.contact.message}</span>}
        </div>

        {/* Membership Price */}
        <div className="form-control">
          <label className="label"><span className="label-text">Membership Price (₹/month)</span></label>
          <input type="number" className={`input input-bordered ${errors.membershipPrice ? 'input-error' : ''}`} {...register('membershipPrice')} />
          {errors.membershipPrice && <span className="text-error text-sm mt-1">{errors.membershipPrice.message}</span>}
        </div>

        {/* Amenities */}
        <div className="form-control">
          <label className="label"><span className="label-text">Amenities</span></label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => toggleAmenity(amenity)}
                className={`btn btn-sm ${selectedAmenities.includes(amenity) ? 'btn-primary' : 'btn-outline'}`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Images</span></label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleImageUpload}
          />
          {imageLoading && <p className="text-sm mt-1">Uploading images...</p>}
          {imagePreview.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {imagePreview.map((url, i) => (
                <img key={i} src={url} className="h-20 w-20 object-cover rounded-lg" />
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Location</span></label>
          <button
            type="button"
            onClick={handleGetLocation}
            className={`btn btn-outline ${locationLoading ? 'loading' : ''}`}
          >
            📍 {location ? 'Location Set ✅' : 'Update Location'}
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <button type="submit" className="btn btn-primary flex-1">
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}

export default EditGym