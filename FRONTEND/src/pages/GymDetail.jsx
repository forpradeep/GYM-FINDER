import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from '../utils/axiosInstance'
import { useTheme } from '../context/ThemeContext'
const { theme } = useTheme()

const GymDetail = () => {
  const { id } = useParams()
  const [gym, setGym] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavourited, setIsFavourited] = useState(false)
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const { isLoggedIn, user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGym = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get(`/gyms/${id}`)
        setGym(response.data.gym)
      } catch(err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }

    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get(`/reviews/${id}`)
        setReviews(response.data.reviews)
      } catch(err) {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      setReviewLoading(true)
      setReviewError(null)
      const response = await axiosInstance.post(`/reviews/${id}`, { rating, comment })
      setReviews([response.data.review, ...reviews])
      setComment('')
      setRating(5)
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
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5' }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!gym) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5' }}>
      <p className="text-gray-400 text-xl">Gym not found</p>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        {gym.images && gym.images.length > 0 ? (
          <div className="w-full h-full">
            <img
              src={gym.images[activeImage]}
              alt={gym.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            {/* Image dots */}
            {gym.images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
                {gym.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ backgroundColor: i === activeImage ? '#D4AF37' : '#666' }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
            <span className="text-8xl">🏋️</span>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #333' }}
        >
          ← Back
        </button>

        {/* Title overlay */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold text-white">{gym.title}</h1>
              <p className="text-gray-300 mt-1">📍 {gym.address}</p>
            </div>
            {averageRating && (
              <div
                className="px-4 py-2 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid #D4AF37' }}
              >
                <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>{averageRating}</p>
                <p className="text-gray-400 text-xs">⭐ rating</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <p className="text-gray-400 text-sm mb-1">Membership</p>
            <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>₹{gym.membershipPrice}</p>
            <p className="text-gray-500 text-xs">/month</p>
          </div>
          <div
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <p className="text-gray-400 text-sm mb-1">Reviews</p>
            <p className="text-2xl font-bold text-white">{reviews.length}</p>
            <p className="text-gray-500 text-xs">total reviews</p>
          </div>
          <div
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <p className="text-gray-400 text-sm mb-1">Contact</p>
            <a
              href={`tel:${gym.contact}`}
              className="text-lg font-bold text-white hover:text-yellow-400 transition-colors"
            >
              {gym.contact}
            </a>
          </div>
          <div
            className="p-4 rounded-xl text-center"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <p className="text-gray-400 text-sm mb-1">WhatsApp</p>
            <a
              href={`https://wa.me/${gym.contact}`}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-bold text-green-400 hover:text-green-300 transition-colors"
            >
              Chat Now
            </a>
          </div>
        </div>

        {/* Contact + Email */}
        <div
          className="flex items-center justify-between p-4 rounded-xl mb-10"
          style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
        >
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${gym.emailId}`}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-white hover:text-yellow-400 transition-colors"
            >
              {gym.emailId}
            </a>
          </div>
          <a
            href={`https://mail.google.com/mail/?view=cm&to=${gym.emailId}`}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded-lg font-medium text-black transition-all hover:opacity-90"
            style={{ backgroundColor: '#D4AF37' }}
          >
            Send Email
          </a>
        </div>

        {/* Amenities */}
        {gym.amenities && gym.amenities.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {gym.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #D4AF37',
                    color: '#D4AF37'
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add to Favourites */}
        {isLoggedIn && user && user.role === 'seeker' && (
          <button
            onClick={handleFavourite}
            disabled={isFavourited}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90 mb-10"
            style={{
              backgroundColor: isFavourited ? '#2a2a2a' : '#D4AF37',
              color: isFavourited ? '#666' : '#000',
              border: isFavourited ? '1px solid #333' : 'none'
            }}
          >
            {isFavourited ? '❤️ Added to Favourites' : '🤍 Add to Favourites'}
          </button>
        )}

        {/* Reviews */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Reviews</h2>
            {averageRating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">⭐</span>
                <span className="text-white font-bold text-xl">{averageRating}</span>
                <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          {isLoggedIn && user && user.role === 'seeker' && (
            <form
              onSubmit={handleReviewSubmit}
              className="p-6 rounded-xl mb-8"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <h3 className="font-bold text-white mb-4">Write a Review</h3>

              {reviewError && (
                <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                  {reviewError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-all hover:scale-110"
                      style={{ opacity: star <= rating ? 1 : 0.3 }}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border focus:outline-none"
                  style={{ backgroundColor: '#0a0a0a', borderColor: '#333' }}
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                style={{ backgroundColor: '#D4AF37' }}
              >
                {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Display Reviews */}
          {reviews.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl"
              style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-400">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-5 rounded-xl"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-black"
                        style={{ backgroundColor: '#D4AF37' }}
                      >
                        {review.userId?.firstName?.[0] || 'A'}
                      </div>
                      <p className="font-bold text-white">{review.userId?.firstName || 'Anonymous'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ opacity: star <= review.rating ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 ml-12">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2 ml-12">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GymDetail