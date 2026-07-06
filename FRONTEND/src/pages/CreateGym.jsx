import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'

const gymSchema = z.object({
  title: z.string().min(3, "Minimum 3 characters").max(50, "Maximum 50 characters"),
  address: z.string().min(3, "Address too short").max(200, "Address too long"),
  emailId: z.string().email("Invalid email"),
  contact: z.string().min(10, "Invalid contact number"),
  membershipPrice: z.string().min(1, "Price is required"),
})

const AMENITIES = ['Parking', 'Locker', 'Trainer', 'Sauna', 'Pool', 'Cardio', 'Weights', 'Yoga']

const CreateGym = () => {
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(gymSchema)
  })

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
      (err) => {
        setError("Location access denied")
        setLocationLoading(false)
      }
    )
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
      if (!location) {
        setError("Please set your gym location first")
        return
      }
      setError(null)
      await axiosInstance.post('/gyms', {
        ...data,
        amenities: selectedAmenities,
        lat: location.lat,
        lng: location.lng
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Failed to create gym')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">List Your Gym</h1>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Title */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Name</span></label>
          <input type="text" placeholder="Fitness Hub" className={`input input-bordered ${errors.title ? 'input-error' : ''}`} {...register('title')} />
          {errors.title && <span className="text-error text-sm mt-1">{errors.title.message}</span>}
        </div>

        {/* Address */}
        <div className="form-control">
          <label className="label"><span className="label-text">Address</span></label>
          <input type="text" placeholder="123 MG Road, Delhi" className={`input input-bordered ${errors.address ? 'input-error' : ''}`} {...register('address')} />
          {errors.address && <span className="text-error text-sm mt-1">{errors.address.message}</span>}
        </div>

        {/* Email */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Email</span></label>
          <input type="email" placeholder="gym@example.com" className={`input input-bordered ${errors.emailId ? 'input-error' : ''}`} {...register('emailId')} />
          {errors.emailId && <span className="text-error text-sm mt-1">{errors.emailId.message}</span>}
        </div>

        {/* Contact */}
        <div className="form-control">
          <label className="label"><span className="label-text">Contact Number</span></label>
          <input type="text" placeholder="9876543210" className={`input input-bordered ${errors.contact ? 'input-error' : ''}`} {...register('contact')} />
          {errors.contact && <span className="text-error text-sm mt-1">{errors.contact.message}</span>}
        </div>

        {/* Membership Price */}
        <div className="form-control">
          <label className="label"><span className="label-text">Membership Price (₹/month)</span></label>
          <input type="number" placeholder="1500" className={`input input-bordered ${errors.membershipPrice ? 'input-error' : ''}`} {...register('membershipPrice')} />
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

        {/* Location */}
        <div className="form-control">
          <label className="label"><span className="label-text">Gym Location</span></label>
          <button type="button" onClick={handleGetLocation} className={`btn btn-outline ${locationLoading ? 'loading' : ''}`}>
            📍 {location ? `Location Set ✅` : 'Use My Current Location'}
          </button>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4">
          List My Gym
        </button>

      </form>
    </div>
  )
}

export default CreateGym