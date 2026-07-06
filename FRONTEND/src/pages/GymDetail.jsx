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

  if (loading) return <p className="text-center p-4">Loading...</p>
  if (!gym) return <p className="text-center p-4">Gym not found</p>

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold">{gym.title}</h1>
        <p className="text-gray-500 mt-1">{gym.address}</p>
      </div>

      {/* Images */}
      {gym.images?.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {gym.images.map((img, index) => (
            <img key={index} src={img} alt="gym" className="h-48 rounded-lg object-cover" />
          ))}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card bg-base-200 p-4">
          <p className="text-sm text-gray-500">Membership Price</p>
          <p className="text-xl font-bold">₹{gym.membershipPrice}/month</p>
        </div>
        <div className="card bg-base-200 p-4">
          <p className="text-sm text-gray-500">Contact</p>
          <a href={`tel:${gym.contact}`} className="text-xl font-bold hover:text-primary">
            {gym.contact}
          </a>
        </div>
        <div className="card bg-base-200 p-4">
          <p className="text-sm text-gray-500">Email</p>
          
           <a href={`https://mail.google.com/mail/?view=cm&to=${gym.emailId}`}
            target="_blank"
            rel="noreferrer"
            className="text-xl font-bold hover:text-primary"
          >
            {gym.emailId}
          </a>
        </div>
        <div className="card bg-base-200 p-4">
          <p className="text-sm text-gray-500">WhatsApp</p>
          
           <a href={`https://wa.me/${gym.contact}`}
            target="_blank"
            rel="noreferrer"
            className="text-xl font-bold text-green-500 hover:text-green-400"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Amenities */}
      {gym.amenities?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {gym.amenities.map((amenity, index) => (
              <span key={index} className="badge badge-primary badge-lg">{amenity}</span>
            ))}
          </div>
        </div>
      )}

      {/* Add to Favourites */}
      {isLoggedIn && user?.role === 'seeker' && (
        <button
          onClick={handleFavourite}
          className={`btn w-full mb-6 ${isFavourited ? 'btn-disabled' : 'btn-primary'}`}
        >
          {isFavourited ? '❤️ Added to Favourites' : '🤍 Add to Favourites'}
        </button>
      )}

      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>

        {/* Add Review Form — only for logged in seekers */}
        {isLoggedIn && user?.role === 'seeker' && (
          <form onSubmit={handleReviewSubmit} className="card bg-base-200 p-4 mb-6">
            <h3 className="font-bold mb-3">Write a Review</h3>

            {reviewError && (
              <div className="alert alert-error mb-3">
                <span>{reviewError}</span>
              </div>
            )}

            <div className="form-control mb-3">
              <label className="label"><span className="label-text">Rating</span></label>
              <select
                className="select select-bordered"
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

            <div className="form-control mb-3">
              <label className="label"><span className="label-text">Comment</span></label>
              <textarea
                className="textarea textarea-bordered"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${reviewLoading ? 'loading' : ''}`}
              disabled={reviewLoading}
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Display Reviews */}
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review._id} className="card bg-base-200 p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold">{review.userId?.firstName || 'Anonymous'}</p>
                  <p className="text-yellow-400">{'⭐'.repeat(review.rating)}</p>
                </div>
                <p>{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default GymDetail