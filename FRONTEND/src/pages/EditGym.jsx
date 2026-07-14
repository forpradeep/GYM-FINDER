import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const gymSchema = z.object({
  title: z.string().min(3, "Minimum 3 characters").max(50, "Maximum 50 characters"),
  address: z.string().min(3, "Address too short").max(200, "Address too long"),
  emailId: z.string().email("Invalid email"),
  contact: z.string().min(10, "Invalid contact number"),
})

const DEFAULT_AMENITIES = ['Parking', 'Locker', 'Trainer', 'Sauna', 'Pool', 'Cardio', 'Weights', 'Yoga']
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const CreateGym = () => {
  const [error, setError] = useState(null)
  const [location, setLocation] = useState(null)
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [customAmenity, setCustomAmenity] = useState('')
  const [customAmenities, setCustomAmenities] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imageLoading, setImageLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState([])
  const [socialLinks, setSocialLinks] = useState({
    instagram: '', facebook: '', twitter: '', youtube: ''
  })
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    { type: 'monthly', price: '' },
    { type: '3months', price: '' },
    { type: '6months', price: '' },
    { type: 'yearly', price: '' }
  ])
  const [timing, setTiming] = useState({
    monday: { open: '06:00', close: '22:00', isClosed: false },
    tuesday: { open: '06:00', close: '22:00', isClosed: false },
    wednesday: { open: '06:00', close: '22:00', isClosed: false },
    thursday: { open: '06:00', close: '22:00', isClosed: false },
    friday: { open: '06:00', close: '22:00', isClosed: false },
    saturday: { open: '06:00', close: '22:00', isClosed: false },
    sunday: { open: '06:00', close: '22:00', isClosed: true }
  })
  if (gym.timing) {
  setTiming(gym.timing)
}
  const navigate = useNavigate()
  const { id } = useParams()
  const { theme } = useTheme()

  const bg = theme === 'dark' ? '#000f00' : '#f0fff0'
  const cardBg = theme === 'dark' ? '#002500' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#005500' : '#b0e0b0'
  const textPrimary = theme === 'dark' ? '#ffffff' : '#111111'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
  const inputBg = theme === 'dark' ? '#001500' : '#f9fff9'
  const inputBorder = theme === 'dark' ? '#005500' : '#b0e0b0'
  const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(gymSchema)
  })

  const handleGetLocation = () => {
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        setLocationLoading(false)
      },
      () => { setError("Location access denied"); setLocationLoading(false) }
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
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    )
  }

  const addCustomAmenity = () => {
    if (!customAmenity.trim()) return
    if (customAmenities.includes(customAmenity.trim())) return
    setCustomAmenities(prev => [...prev, customAmenity.trim()])
    setSelectedAmenities(prev => [...prev, customAmenity.trim()])
    setCustomAmenity('')
  }

  const removeCustomAmenity = (amenity) => {
    setCustomAmenities(prev => prev.filter(a => a !== amenity))
    setSelectedAmenities(prev => prev.filter(a => a !== amenity))
  }

  const getPlanLabel = (type) => ({
    monthly: '1 Month', '3months': '3 Months',
    '6months': '6 Months', yearly: '1 Year'
  }[type])

  const onSubmit = async (data) => {
    try {
      if (!location) { setError("Please set your gym location first"); return }
      setError(null)
      await axiosInstance.put(`/gyms/${id}`, {
        ...data,
        amenities: selectedAmenities,
        images,
        socialLinks,
        subscriptionPlans: subscriptionPlans.filter(p => p.price),
        timing,
        ...(location && { lat: location.lat, lng: location.lng })
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Failed to create gym')
    }
  }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      <div className="px-8 py-8" style={{ borderBottom: `1px solid ${cardBorder}` }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>List Your Gym</h1>
          <p className="mt-1" style={{ color: textSecondary }}>Fill in your gym details to get listed</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        {error && <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Name</label>
            <input type="text" placeholder="Fitness Hub"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : inputBorder }}
              {...register('title')} />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Address</label>
            <input type="text" placeholder="123 MG Road, Delhi"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              style={{ ...inputStyle, borderColor: errors.address ? '#ef4444' : inputBorder }}
              {...register('address')} />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
          </div>

          {/* Email + Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Email</label>
              <input type="email" placeholder="gym@example.com"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.emailId ? '#ef4444' : inputBorder }}
                {...register('emailId')} />
              {errors.emailId && <p className="text-red-400 text-sm mt-1">{errors.emailId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Contact Number</label>
              <input type="text" placeholder="9876543210"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.contact ? '#ef4444' : inputBorder }}
                {...register('contact')} />
              {errors.contact && <p className="text-red-400 text-sm mt-1">{errors.contact.message}</p>}
            </div>
          </div>

          {/* Subscription Plans */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Subscription Plans</label>
            <div className="grid grid-cols-2 gap-4">
              {subscriptionPlans.map((plan, i) => (
                <div key={plan.type} className="p-4 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                  <p className="text-sm font-medium mb-2" style={{ color: '#D4AF37' }}>{getPlanLabel(plan.type)}</p>
                  <div className="flex items-center gap-2">
                    <span style={{ color: textSecondary }}>₹</span>
                    <input type="number" placeholder="Enter price" value={plan.price}
                      onChange={(e) => {
                        const updated = [...subscriptionPlans]
                        updated[i].price = e.target.value
                        setSubscriptionPlans(updated)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none text-sm"
                      style={inputStyle} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Amenities</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {DEFAULT_AMENITIES.map((amenity) => (
                <button key={amenity} type="button" onClick={() => toggleAmenity(amenity)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedAmenities.includes(amenity) ? '#D4AF37' : cardBg,
                    color: selectedAmenities.includes(amenity) ? '#000' : '#D4AF37',
                    border: '1px solid #D4AF37'
                  }}>
                  {amenity}
                </button>
              ))}
            </div>
            {customAmenities.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {customAmenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#D4AF37', color: '#000' }}>
                    <span>{amenity}</span>
                    <button type="button" onClick={() => removeCustomAmenity(amenity)} className="hover:opacity-70 font-bold">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" placeholder="Add custom amenity..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none text-sm"
                style={inputStyle} />
              <button type="button" onClick={addCustomAmenity}
                className="px-4 py-2 rounded-lg font-bold text-black transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4AF37' }}>
                + Add
              </button>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Opening Hours</label>
            <div className="flex flex-col gap-2">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4 p-3 rounded-lg flex-wrap"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="w-24 capitalize font-medium text-sm" style={{ color: textPrimary }}>{day}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={timing[day].isClosed}
                      onChange={(e) => setTiming(prev => ({
                        ...prev, [day]: { ...prev[day], isClosed: e.target.checked }
                      }))}
                      className="accent-yellow-500" />
                    <span className="text-sm" style={{ color: '#ef4444' }}>Closed</span>
                  </label>
                  {!timing[day].isClosed ? (
                    <>
                      <input type="time" value={timing[day].open}
                        onChange={(e) => setTiming(prev => ({
                          ...prev, [day]: { ...prev[day], open: e.target.value }
                        }))}
                        className="px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle} />
                      <span style={{ color: textSecondary }}>to</span>
                      <input type="time" value={timing[day].close}
                        onChange={(e) => setTiming(prev => ({
                          ...prev, [day]: { ...prev[day], close: e.target.value }
                        }))}
                        className="px-3 py-1.5 rounded-lg border text-sm focus:outline-none"
                        style={inputStyle} />
                    </>
                  ) : (
                    <span className="text-sm" style={{ color: '#ef4444' }}>Closed all day</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Social Media Links</label>
            <div className="flex flex-col gap-3">
              {[
                { key: 'instagram', placeholder: 'https://instagram.com/yourgym', emoji: '📸' },
                { key: 'facebook', placeholder: 'https://facebook.com/yourgym', emoji: '👥' },
                { key: 'twitter', placeholder: 'https://twitter.com/yourgym', emoji: '🐦' },
                { key: 'youtube', placeholder: 'https://youtube.com/@yourgym', emoji: '▶️' },
              ].map((social) => (
                <div key={social.key} className="flex items-center gap-3">
                  <span className="text-xl w-8">{social.emoji}</span>
                  <input type="url" placeholder={social.placeholder}
                    value={socialLinks[social.key]}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, [social.key]: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-lg border focus:outline-none text-sm"
                    style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Images</label>
            <label className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-yellow-500"
              style={{ borderColor: inputBorder, backgroundColor: cardBg }}>
              <span className="text-3xl mb-2">📸</span>
              <p className="text-sm" style={{ color: textSecondary }}>Click to upload gym photos</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {imageLoading && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm" style={{ color: textSecondary }}>Uploading images...</p>
              </div>
            )}
            {imagePreview.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imagePreview.map((url, i) => (
                  <img key={i} src={url} className="h-20 w-20 object-cover rounded-lg" style={{ border: '1px solid #D4AF37' }} />
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Location</label>
            <button type="button" onClick={handleGetLocation}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: location ? '#1a2a1a' : cardBg,
                border: `1px solid ${location ? '#22c55e' : inputBorder}`,
                color: location ? '#22c55e' : '#D4AF37'
              }}>
              {locationLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  Getting location...
                </span>
              ) : location ? '📍 Location Set ✅' : '📍 Use My Current Location'}
            </button>
          </div>

          <button type="submit"
            className="w-full py-4 rounded-lg font-bold text-black text-lg transition-all hover:opacity-90 hover:scale-105 mt-4"
            style={{ backgroundColor: '#D4AF37' }}>
            List My Gym
          </button>

        </form>
      </div>
    </div>
  )
}

export default CreateGym