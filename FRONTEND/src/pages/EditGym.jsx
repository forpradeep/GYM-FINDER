import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
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

const EditGym = () => {
  const { theme } = useTheme()
  const { id } = useParams()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
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
  const navigate = useNavigate()

  const bg = theme === 'dark' ? '#000f00' : '#f0fff0'
  const cardBg = theme === 'dark' ? '#002500' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#005500' : '#b0e0b0'
  const textPrimary = theme === 'dark' ? '#ffffff' : '#111111'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
  const inputBg = theme === 'dark' ? '#00000f' : '#f0f0ff'
  const inputBorder = theme === 'dark' ? '#1a1a5a' : '#c0c0ff'
  const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }

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
        })

        const customs = gym.amenities?.filter(a => !DEFAULT_AMENITIES.includes(a)) || []
        setSelectedAmenities(gym.amenities || [])
        setCustomAmenities(customs)
        setImages(gym.images || [])
        setImagePreview(gym.images || [])

        if (gym.socialLinks) {
          setSocialLinks({
            instagram: gym.socialLinks.instagram || '',
            facebook: gym.socialLinks.facebook || '',
            twitter: gym.socialLinks.twitter || '',
            youtube: gym.socialLinks.youtube || ''
          })
        }

        // Load existing subscription plans
        if (gym.subscriptionPlans && gym.subscriptionPlans.length > 0) {
          const planMap = {}
          gym.subscriptionPlans.forEach(p => planMap[p.type] = p.price)
          setSubscriptionPlans([
            { type: 'monthly', price: planMap['monthly'] || '' },
            { type: '3months', price: planMap['3months'] || '' },
            { type: '6months', price: planMap['6months'] || '' },
            { type: 'yearly', price: planMap['yearly'] || '' }
          ])
        }

        if (gym.location?.coordinates) {
          setLocation({ lat: gym.location.coordinates[1], lng: gym.location.coordinates[0] })
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

  const onSubmit = async (data) => {
    try {
      setError(null)
      await axiosInstance.put(`/gyms/${id}`, {
        ...data,
        amenities: selectedAmenities,
        images,
        socialLinks,
        subscriptionPlans: subscriptionPlans.filter(p => p.price),
        ...(location && { lat: location.lat, lng: location.lng })
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data || 'Failed to update gym')
    }
  }

  const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }

  const getPlanLabel = (type) => ({
    monthly: '1 Month', '3months': '3 Months',
    '6months': '6 Months', yearly: '1 Year'
  }[type])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: bg }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      <div className="px-8 py-8" style={{ borderBottom: `1px solid ${cardBorder}` }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>Edit Gym</h1>
          <p className="mt-1" style={{ color: textSecondary }}>Update your gym details</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        {error && (
          <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Name</label>
            <input type="text"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : inputBorder }}
              {...register('title')} />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Address</label>
            <input type="text"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              style={{ ...inputStyle, borderColor: errors.address ? '#ef4444' : inputBorder }}
              {...register('address')} />
            {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
          </div>

          {/* Email + Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Email</label>
              <input type="email"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.emailId ? '#ef4444' : inputBorder }}
                {...register('emailId')} />
              {errors.emailId && <p className="text-red-400 text-sm mt-1">{errors.emailId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Contact Number</label>
              <input type="text"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                style={{ ...inputStyle, borderColor: errors.contact ? '#ef4444' : inputBorder }}
                {...register('contact')} />
              {errors.contact && <p className="text-red-400 text-sm mt-1">{errors.contact.message}</p>}
            </div>
          </div>

          {/* Subscription Plans */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>
              Subscription Plans
            </label>
            <div className="grid grid-cols-2 gap-4">
              {subscriptionPlans.map((plan, i) => (
                <div
                  key={plan.type}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
                >
                  <p className="text-sm font-medium mb-2" style={{ color: '#D4AF37' }}>
                    {getPlanLabel(plan.type)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span style={{ color: textSecondary }}>₹</span>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={plan.price}
                      onChange={(e) => {
                        const updated = [...subscriptionPlans]
                        updated[i].price = e.target.value
                        setSubscriptionPlans(updated)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border focus:outline-none text-sm"
                      style={inputStyle}
                    />
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
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: selectedAmenities.includes(amenity) ? '#D4AF37' : cardBg,
                    color: selectedAmenities.includes(amenity) ? '#000' : '#D4AF37',
                    border: '1px solid #D4AF37'
                  }}
                >
                  {amenity}
                </button>
              ))}
            </div>

            {customAmenities.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {customAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#D4AF37', color: '#000' }}
                  >
                    <span>{amenity}</span>
                    <button type="button" onClick={() => removeCustomAmenity(amenity)} className="hover:opacity-70 font-bold">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom amenity..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAmenity())}
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none text-sm"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-4 py-2 rounded-lg font-bold text-black transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4AF37' }}
              >
                + Add
              </button>
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
                  <input
                    type="url"
                    placeholder={social.placeholder}
                    value={socialLinks[social.key]}
                    onChange={(e) => setSocialLinks(prev => ({ ...prev, [social.key]: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-lg border focus:outline-none text-sm"
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Images</label>
            {imagePreview.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {imagePreview.map((url, i) => (
                  <img key={i} src={url} className="h-20 w-20 object-cover rounded-lg"
                    style={{ border: '1px solid #D4AF37' }} />
                ))}
              </div>
            )}
            <label
              className="flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-yellow-500"
              style={{ borderColor: inputBorder, backgroundColor: cardBg }}
            >
              <span className="text-2xl mb-1">📸</span>
              <p className="text-sm" style={{ color: textSecondary }}>Click to update gym photos</p>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {imageLoading && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm" style={{ color: textSecondary }}>Uploading images...</p>
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gym Location</label>
            <button
              type="button"
              onClick={handleGetLocation}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-80"
              style={{
                backgroundColor: location ? '#1a2a1a' : cardBg,
                border: `1px solid ${location ? '#22c55e' : inputBorder}`,
                color: location ? '#22c55e' : '#D4AF37'
              }}
            >
              {locationLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  Getting location...
                </span>
              ) : location ? '📍 Location Set ✅' : '📍 Update Location'}
            </button>
          </div>

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
              style={{ border: `1px solid ${cardBorder}`, color: textSecondary }}
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