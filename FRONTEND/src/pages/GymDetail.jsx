import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axiosInstance from '../utils/axiosInstance'

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

  useEffect(() => {
    const fetchGym = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/gyms/${id}`);
        setGym(response.data.gym);
      } catch(err) {
        console.log(err);
      } finally {
        setLoading(false);
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

    fetchGym();
    fetchReviews();
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!gym) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <p className="text-gray-400 text-xl">Gym not found</p>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>

      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        {gym.images?.length > 0 ? (
          <>
            <img
              src={gym.images[activeImage]}
              alt={gym.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            {/* Image Thumbnails */}
            {gym.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
            <span className="text-8xl">🏋️</span>
          </div>
        )}

        {/* Gym Title Overlay */}
        <div className="absolute bottom-8 left-8">
          <h1 className="text-4xl font-bold text-white">{gym.title}</h1>
          <p className="text-gray-300 mt-1">📍 {gym.address}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-gray-400 text-sm mb-1">Membership</p>
            <p className="text-xl font-bold" style={{ color: '#D4AF37' }}>₹{gym.membershipPrice}</p>
            <p className="text-gray-500 text-xs">/month</p>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-gray-400 text-sm mb-1">Contact</p>
            <a href={`tel:${gym.contact}`} className="text-lg font-bold text-white hover:text-yellow-400 transition-colors">
              {gym.contact}
            </a>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <a
              href={`https://mail.google.com/mail/?view=cm&to=${gym.emailId}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-bold text-white hover:text-yellow-400 transition-colors break-all"
            >
              {gym.emailId}
            </a>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}>
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

        {/* Amenities */}
        {gym.amenities?.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-3">
              {gym.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #D4AF37', color: '#D4AF37' }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add to Favourites */}
        {isLoggedIn && user?.role === 'seeker' && (
          <button
            onClick={handleFavourite}
            disabled={isFavourited}
            className="w-full py-4 rounded-xl font-bold text-black text-lg transition-all hover:opacity-90 mb-10"
            style={{ backgroundColor: isFavourited ? '#555' : '#D4AF37', color: isFavourited ? '#999' : '#000' }}
          >
            {isFavourited ? '❤️ Added to Favourites' : '🤍 Add to Favourites'}
          </button>
        )}

        {/* Reviews */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Reviews</h2>

          {/* Add Review Form */}
          {isLoggedIn && user?.role === 'seeker' && (
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
                <select
                  className="w-full px-4 py-3 rounded-lg text-white border focus:outline-none"
                  style={{ backgroundColor: '#0a0a0a', borderColor: '#333' }}
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ — Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ — Good</option>
                  <option value={3}>⭐⭐⭐ — Average</option>
                  <option value={2}>⭐⭐ — Poor</option>
                  <option value={1}>⭐ — Terrible</option>
                </select>
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
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="p-5 rounded-xl"
                  style={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-bold text-white">{review.userId?.firstName || 'Anonymous'}</p>
                    <p className="text-yellow-400">{'⭐'.repeat(review.rating)}</p>
                  </div>
                  <p className="text-gray-300">{review.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
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