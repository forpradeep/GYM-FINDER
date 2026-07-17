import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from '../utils/axiosInstance'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const getPlanLabel = (type) => ({
  monthly: '1 Month', '3months': '3 Months',
  '6months': '6 Months', yearly: '1 Year'
}[type])

const EnrolSection = ({ gymId, ownerId, subscriptionPlans, membershipPrice, theme }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrolled, setEnrolled] = useState(false)
  const [error, setError] = useState(null)

  const cardBg = theme === 'dark' ? '#1a0f00' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#5a3d00' : '#f0d080'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'

  const handleEnrol = async () => {
    if (!selectedPlan) return
    setEnrolling(true)
    setError(null)
    try {
      await axiosInstance.post(`/members/enrol/${gymId}`, { subscriptionType: selectedPlan, ownerId })
      setEnrolled(true)
    } catch (err) {
      setError(err.response?.data || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (enrolled) return (
    <div className="p-6 rounded-xl text-center" style={{ backgroundColor: cardBg, border: '1px solid #22c55e' }}>
      <p className="text-4xl mb-3">🎉</p>
      <p className="text-xl font-bold text-green-400">Successfully Enrolled!</p>
      <p className="mt-2" style={{ color: textSecondary }}>Your {getPlanLabel(selectedPlan)} membership is now active.</p>
    </div>
  )

  const plans = subscriptionPlans && subscriptionPlans.length > 0
    ? subscriptionPlans : [{ type: 'monthly', price: membershipPrice }]

  return (
    <div>
      {error && <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {plans.map((plan, i) => (
          <button key={i} type="button" onClick={() => setSelectedPlan(plan.type)}
            className="p-4 rounded-xl text-center transition-all hover:scale-105"
            style={{
              backgroundColor: selectedPlan === plan.type ? '#D4AF37' : cardBg,
              border: `1px solid ${selectedPlan === plan.type ? '#D4AF37' : cardBorder}`,
              color: selectedPlan === plan.type ? '#000' : '#D4AF37'
            }}>
            <p className="text-sm mb-1" style={{ color: selectedPlan === plan.type ? '#000' : textSecondary }}>
              {getPlanLabel(plan.type)}
            </p>
            <p className="text-2xl font-bold">₹{plan.price}</p>
          </button>
        ))}
      </div>
      <button onClick={handleEnrol} disabled={!selectedPlan || enrolling}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90"
        style={{
          backgroundColor: selectedPlan ? '#D4AF37' : cardBg,
          color: selectedPlan ? '#000' : textSecondary,
          border: selectedPlan ? 'none' : `1px solid ${cardBorder}`
        }}>
        {enrolling ? 'Enrolling...' : selectedPlan ? `Enrol for ${getPlanLabel(selectedPlan)}` : 'Select a Plan to Enrol'}
      </button>
    </div>
  )
}

const GymDetail = () => {
  const { theme } = useTheme()
  const { id } = useParams()
  const [gym, setGym] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavourited, setIsFavourited] = useState(false)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewImages, setReviewImages] = useState([])
  const [reviewImagePreview, setReviewImagePreview] = useState([])
  const [reviewError, setReviewError] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [lightboxImage, setLightboxImage] = useState(null)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const bg = theme === 'dark' ? '#0f0800' : '#fffaf0'
  const cardBg = theme === 'dark' ? '#1a0f00' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#5a3d00' : '#f0d080'
  const textPrimary = theme === 'dark' ? '#ffffff' : '#111111'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
  const inputBg = theme === 'dark' ? '#0f0800' : '#fffaf0'
  const inputBorder = theme === 'dark' ? '#5a3d00' : '#f0d080'

  useEffect(() => {
    const fetchGym = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/gyms/${id}`)
        setGym(response.data.gym)
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/reviews/${id}`)
        setReviews(response.data.reviews)
      } catch (err) {
        console.log(err)
      }
    }
    fetchGym()
    fetchReviews()
  }, [id])

  const handleFavourite = async () => {
    try {
      await axiosInstance.post(`/favourites/${id}`)
      setIsFavourited(true)
    } catch (err) {
      console.log(err)
    }
  }

  const handleReviewImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('images', file))
      const response = await axios.post('https://gymfinder-backend-z655.onrender.com/api/gyms/upload', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setReviewImages(response.data.urls)
      setReviewImagePreview(files.map(file => URL.createObjectURL(file)))
    } catch (err) {
      console.log('Image upload failed', err)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      setReviewLoading(true)
      setReviewError(null)
      const response = await axiosInstance.post(`/reviews/${id}`, {
        rating, comment, images: reviewImages
      })
      setReviews([response.data.review, ...reviews])
      setComment('')
      setRating(5)
      setReviewImages([])
      setReviewImagePreview([])
    } catch (err) {
      setReviewError(err.response?.data || 'Failed to submit review')
    } finally {
      setReviewLoading(false)
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: bg }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!gym) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: bg }}>
      <p className="text-xl" style={{ color: textSecondary }}>Gym not found</p>
    </div>
  )

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        {gym.images && gym.images.length > 0 ? (
          <div className="w-full h-full">
            <img src={gym.images[activeImage]} alt={gym.title}
              className="w-full h-full object-cover transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            {gym.images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {gym.images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ backgroundColor: i === activeImage ? '#D4AF37' : '#666' }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: cardBg }}>
            <span className="text-8xl">🏋️</span>
          </div>
        )}

        <button onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #333' }}>
          ← Back
        </button>

        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-white">{gym.title}</h1>
              <p className="text-gray-300 mt-1">📍 {gym.address}</p>
            </div>
            {averageRating && (
              <div className="px-4 py-2 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid #D4AF37' }}>
                <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>{averageRating}</p>
                <p className="text-gray-400 text-xs">⭐ rating</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Membership Plans */}
        {gym.subscriptionPlans && gym.subscriptionPlans.length > 0 ? (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>Membership Plans</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gym.subscriptionPlans.map((plan, i) => (
                <div key={i} className="p-5 rounded-xl text-center transition-all hover:scale-105"
                  style={{ backgroundColor: cardBg, border: '1px solid #D4AF37' }}>
                  <p className="text-sm mb-2" style={{ color: textSecondary }}>{getPlanLabel(plan.type)}</p>
                  <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>₹{plan.price}</p>
                  <p className="text-xs mt-1" style={{ color: textSecondary }}>per plan</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>Membership</h2>
            <div className="p-5 rounded-xl text-center w-48"
              style={{ backgroundColor: cardBg, border: '1px solid #D4AF37' }}>
              <p className="text-sm mb-2" style={{ color: textSecondary }}>Monthly</p>
              <p className="text-3xl font-bold" style={{ color: '#D4AF37' }}>₹{gym.membershipPrice}</p>
              <p className="text-xs mt-1" style={{ color: textSecondary }}>/month</p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <p className="text-sm mb-1" style={{ color: textSecondary }}>Reviews</p>
            <p className="text-2xl font-bold" style={{ color: textPrimary }}>{reviews.length}</p>
            <p className="text-xs" style={{ color: textSecondary }}>total reviews</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <p className="text-sm mb-1" style={{ color: textSecondary }}>Contact</p>
            <a href={`tel:${gym.contact}`} className="text-lg font-bold hover:text-yellow-400 transition-colors"
              style={{ color: textPrimary }}>{gym.contact}</a>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <p className="text-sm mb-1" style={{ color: textSecondary }}>WhatsApp</p>
            <a href={`https://wa.me/${gym.contact}`} target="_blank" rel="noreferrer"
              className="text-lg font-bold text-green-400 hover:text-green-300 transition-colors">
              Chat Now
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center justify-between p-4 rounded-xl mb-10"
          style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <div>
            <p className="text-sm" style={{ color: textSecondary }}>Email</p>
            <a href={`https://mail.google.com/mail/?view=cm&to=${gym.emailId}`} target="_blank" rel="noreferrer"
              className="font-bold hover:text-yellow-400 transition-colors" style={{ color: textPrimary }}>
              {gym.emailId}
            </a>
          </div>
          <a href={`https://mail.google.com/mail/?view=cm&to=${gym.emailId}`} target="_blank" rel="noreferrer"
            className="px-5 py-2 rounded-lg font-medium text-black transition-all hover:opacity-90"
            style={{ backgroundColor: '#D4AF37' }}>
            Send Email
          </a>
        </div>

        {/* Opening Hours */}
        {gym.timing && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>Opening Hours</h2>
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((day, i) => {
                const dayTiming = gym.timing[day]
                const now = new Date()
                const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
                const isToday = currentDay === day
                let isOpenNow = false
                if (dayTiming && !dayTiming.isClosed && dayTiming.open && dayTiming.close) {
                  const [openH, openM] = dayTiming.open.split(':').map(Number)
                  const [closeH, closeM] = dayTiming.close.split(':').map(Number)
                  const currentMinutes = now.getHours() * 60 + now.getMinutes()
                  const openMinutes = openH * 60 + openM
                  const closeMinutes = closeH * 60 + closeM
                  isOpenNow = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
                }
                return (
                  <div key={day} className="flex justify-between items-center px-5 py-3"
                    style={{
                      borderBottom: i < 6 ? `1px solid ${cardBorder}` : 'none',
                      backgroundColor: isToday ? (theme === 'dark' ? '#1a1500' : '#fffbeb') : 'transparent'
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="capitalize font-medium"
                        style={{ color: isToday ? '#D4AF37' : textPrimary }}>{day}</span>
                      {isToday && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: isOpenNow ? '#22c55e22' : '#ef444422',
                            color: isOpenNow ? '#22c55e' : '#ef4444',
                            border: `1px solid ${isOpenNow ? '#22c55e' : '#ef4444'}`
                          }}>
                          {isOpenNow ? '● Open Now' : '● Closed Now'}
                        </span>
                      )}
                    </div>
                    <span className="text-sm" style={{ color: dayTiming?.isClosed ? '#ef4444' : textSecondary }}>
                      {dayTiming?.isClosed ? 'Closed' : `${dayTiming?.open} – ${dayTiming?.close}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Amenities */}
        {gym.amenities && gym.amenities.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {gym.amenities.map((amenity, index) => (
                <span key={index} className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: cardBg, border: '1px solid #D4AF37', color: '#D4AF37' }}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {(gym.socialLinks?.instagram || gym.socialLinks?.facebook || gym.socialLinks?.twitter || gym.socialLinks?.youtube) && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>Follow Us</h2>
            <div className="flex gap-4 flex-wrap">
              {gym.socialLinks?.instagram && (
                <a href={gym.socialLinks.instagram} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: cardBg, border: '1px solid #E1306C', color: '#E1306C' }}>
                  📸 Instagram
                </a>
              )}
              {gym.socialLinks?.facebook && (
                <a href={gym.socialLinks.facebook} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: cardBg, border: '1px solid #1877F2', color: '#1877F2' }}>
                  👥 Facebook
                </a>
              )}
              {gym.socialLinks?.twitter && (
                <a href={gym.socialLinks.twitter} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: cardBg, border: '1px solid #1DA1F2', color: '#1DA1F2' }}>
                  🐦 Twitter
                </a>
              )}
              {gym.socialLinks?.youtube && (
                <a href={gym.socialLinks.youtube} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: cardBg, border: '1px solid #FF0000', color: '#FF0000' }}>
                  ▶️ YouTube
                </a>
              )}
            </div>
          </div>
        )}

        {/* Add to Favourites */}
        {isLoggedIn && user && user.role === 'seeker' && (
          <button onClick={handleFavourite} disabled={isFavourited}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 mb-6"
            style={{
              backgroundColor: isFavourited ? cardBg : '#D4AF37',
              color: isFavourited ? textSecondary : '#000',
              border: isFavourited ? `1px solid ${cardBorder}` : 'none'
            }}>
            {isFavourited ? '❤️ Added to Favourites' : '🤍 Add to Favourites'}
          </button>
        )}

        {/* Enrol Section */}
        {isLoggedIn && user && user.role === 'seeker' && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>Enrol Now</h2>
            <EnrolSection
              gymId={id}
              ownerId={gym.ownerId}
              subscriptionPlans={gym.subscriptionPlans}
              membershipPrice={gym.membershipPrice}
              theme={theme}
            />
          </div>
        )}

        {/* Reviews */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>Reviews</h2>
            {averageRating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="font-bold text-xl" style={{ color: textPrimary }}>{averageRating}</span>
                <span className="text-sm" style={{ color: textSecondary }}>({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          {isLoggedIn && user && user.role === 'seeker' && (
            <form onSubmit={handleReviewSubmit} className="p-6 rounded-xl mb-8"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              <h3 className="font-bold mb-4" style={{ color: textPrimary }}>Write a Review</h3>

              {reviewError && (
                <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{reviewError}</div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)}
                      className="text-3xl transition-all hover:scale-110"
                      style={{ opacity: star <= rating ? 1 : 0.3 }}>⭐</button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Comment</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }}
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3} />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>
                  Add Photos <span className="font-normal" style={{ color: textSecondary }}>(optional)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border w-fit transition-all hover:border-yellow-500"
                  style={{ borderColor: inputBorder, backgroundColor: inputBg }}>
                  <span>📸</span>
                  <span className="text-sm" style={{ color: textSecondary }}>Upload photos</span>
                  <input type="file" multiple accept="image/*" className="hidden"
                    onChange={handleReviewImageUpload} />
                </label>
                {reviewImagePreview.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {reviewImagePreview.map((url, i) => (
                      <img key={i} src={url} className="h-16 w-16 object-cover rounded-lg"
                        style={{ border: '1px solid #D4AF37' }} />
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" disabled={reviewLoading}
                className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4AF37' }}>
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Display Reviews */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 rounded-xl"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
              <p className="text-4xl mb-3">💬</p>
              <p style={{ color: textSecondary }}>No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="p-5 rounded-xl"
                  style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-black"
                        style={{ backgroundColor: '#D4AF37' }}>
                        {review.userId?.firstName?.[0] || 'A'}
                      </div>
                      <p className="font-bold" style={{ color: textPrimary }}>
                        {review.userId?.firstName || 'Anonymous'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ opacity: star <= review.rating ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="ml-12" style={{ color: textSecondary }}>{review.comment}</p>

                  {/* Review Photos */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3 ml-12 flex-wrap">
                      {review.images.map((img, i) => (
                        <img key={i} src={img}
                          className="h-20 w-20 object-cover rounded-lg cursor-pointer hover:opacity-80 hover:scale-105 transition-all"
                          style={{ border: `1px solid ${cardBorder}` }}
                          onClick={() => setLightboxImage(img)}
                        />
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-2 ml-12" style={{ color: textSecondary }}>
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Review"
              className="max-w-full max-h-screen object-contain rounded-xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-black transition-all hover:opacity-80"
              style={{ backgroundColor: '#D4AF37' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default GymDetail