import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { login } from '../store/authslice'
import axiosInstance from '../utils/axiosInstance'

const getPlanLabel = (type) => ({
  monthly: '1 Month', '3months': '3 Months',
  '6months': '6 Months', yearly: '1 Year'
}[type] || type)

const Settings = () => {
  const { user } = useSelector((state) => state.auth)
  const { theme } = useTheme()
  const dispatch = useDispatch()

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpFor, setOtpFor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [membershipsLoading, setMembershipsLoading] = useState(true)

  // subtle purple tint for settings page

  const bg = theme === 'dark' ? '#00000f' : '#f0f0ff'
const cardBg = theme === 'dark' ? '#05051f' : '#ffffff'
const cardBorder = theme === 'dark' ? '#1a1a5a' : '#c0c0ff'
const textPrimary = theme === 'dark' ? '#ffffff' : '#111111'
const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
const inputBg = theme === 'dark' ? '#00000f' : '#f0f0ff'
const inputBorder = theme === 'dark' ? '#1a1a5a' : '#c0c0ff'
const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }

  useEffect(() => {
    if (user?.role === 'seeker') {
      axiosInstance.get('/members/my-memberships')
        .then(res => setMemberships(res.data.members || []))
        .catch(() => { })
        .finally(() => setMembershipsLoading(false))
    } else {
      setMembershipsLoading(false)
    }
  }, [])

  const isExpired = (endDate) => new Date(endDate) < new Date()

  const showSuccess = (msg) => {
    setSuccess(msg)
    setError(null)
    setTimeout(() => setSuccess(null), 4000)
  }

  const showError = (msg) => {
    setError(msg)
    setSuccess(null)
  }

  const handleSendOTP = async (purpose) => {
    setLoading(true)
    setError(null)
    try {
      await axiosInstance.post('/settings/send-otp')
      setOtpSent(true)
      setOtpFor(purpose)
      showSuccess(`OTP sent to ${user?.emailId}`)
    } catch (err) {
      showError(err.response?.data || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!firstName.trim()) return showError('Name cannot be empty')
    setLoading(true)
    try {
      const response = await axiosInstance.put('/settings/update-name', { firstName })
      dispatch(login({ ...user, firstName: response.data.user.firstName }))
      showSuccess('Name updated successfully!')
    } catch (err) {
      showError(err.response?.data || 'Failed to update name')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail || !otp) return showError('Please fill all fields')
    setLoading(true)
    try {
      const response = await axiosInstance.put('/settings/update-email', { newEmail, otp })
      dispatch(login({ ...user, emailId: response.data.user.emailId }))
      setNewEmail('')
      setOtp('')
      setOtpSent(false)
      setOtpFor(null)
      showSuccess('Email updated successfully!')
    } catch (err) {
      showError(err.response?.data || 'Failed to update email')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!newPassword || !otp) return showError('Please fill all fields')
    if (newPassword.length < 8) return showError('Password must be at least 8 characters')
    setLoading(true)
    try {
      await axiosInstance.put('/settings/update-password', { newPassword, otp })
      setNewPassword('')
      setOtp('')
      setOtpSent(false)
      setOtpFor(null)
      showSuccess('Password updated successfully!')
    } catch (err) {
      showError(err.response?.data || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelMembership = async (memberId) => {
    if (!window.confirm('Cancel this membership?')) return
    try {
      await axiosInstance.delete(`/members/cancel/${memberId}`)
      setMemberships(memberships.filter(m => m._id !== memberId))
      showSuccess('Membership cancelled')
    } catch (err) {
      showError('Failed to cancel membership')
    }
  }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-8 py-8" style={{ borderBottom: `1px solid ${cardBorder}` }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>Settings</h1>
          <p className="mt-1" style={{ color: textSecondary }}>Manage your account credentials</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-10 flex flex-col gap-6">

        {/* Alerts */}
        {success && (
          <div className="border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">✅ {success}</div>
        )}
        {error && (
          <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">❌ {error}</div>
        )}

        {/* My Memberships — seeker only */}
        {user?.role === 'seeker' && (
          <div className="p-6 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: textPrimary }}>My Memberships</h2>
                <p className="text-sm" style={{ color: textSecondary }}>Your active gym subscriptions</p>
              </div>
              <NavLink to="/profile" className="text-sm hover:opacity-80 transition-colors" style={{ color: '#D4AF37' }}>
                View Full Profile →
              </NavLink>
            </div>

            {membershipsLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : memberships.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🏋️</p>
                <p className="text-sm mb-3" style={{ color: textSecondary }}>No memberships yet</p>
                <NavLink
                  to="/"
                  className="px-4 py-2 rounded-lg text-sm font-bold text-black transition-all hover:opacity-90"
                  style={{ backgroundColor: '#D4AF37' }}
                >
                  Browse Gyms
                </NavLink>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {memberships.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: bg, border: `1px solid ${cardBorder}` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5' }}
                      >
                        {m.gymId?.images?.length > 0 ? (
                          <img src={m.gymId.images[0]} alt={m.gymId.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">🏋️</div>
                        )}
                      </div>
                      <div>
                        <NavLink to={`/gym/${m.gymId?._id}`}>
                          <p className="font-bold text-sm hover:text-yellow-400 transition-colors" style={{ color: textPrimary }}>
                            {m.gymId?.title}
                          </p>
                        </NavLink>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#D4AF3722', color: '#D4AF37', border: '1px solid #D4AF37' }}
                          >
                            {getPlanLabel(m.subscriptionType)}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: isExpired(m.endDate) ? '#ef444422' : '#22c55e22',
                              color: isExpired(m.endDate) ? '#ef4444' : '#22c55e',
                              border: `1px solid ${isExpired(m.endDate) ? '#ef4444' : '#22c55e'}`
                            }}
                          >
                            {isExpired(m.endDate) ? 'Expired' : 'Active'}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: textSecondary }}>
                          Until {new Date(m.endDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelMembership(m._id)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
                      style={{ border: '1px solid #ef4444', color: '#ef4444' }}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Update Name */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>Display Name</h2>
          <p className="text-sm mb-4" style={{ color: textSecondary }}>Update how your name appears across the app</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your name"
              className="flex-1 px-4 py-3 rounded-lg border focus:outline-none"
              style={inputStyle}
            />
            <button
              onClick={handleUpdateName}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Update Email */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>Email Address</h2>
          <p className="text-sm mb-1" style={{ color: textSecondary }}>
            Current: <span style={{ color: '#D4AF37' }}>{user?.emailId}</span>
          </p>
          <p className="text-sm mb-4" style={{ color: textSecondary }}>An OTP will be sent to your current email to verify</p>

          <div className="flex flex-col gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New email address"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              style={inputStyle}
            />
            {!otpSent || otpFor !== 'email' ? (
              <button
                onClick={() => handleSendOTP('email')}
                disabled={loading || !newEmail}
                className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
              >
                {loading && otpFor === 'email' ? 'Sending...' : 'Send OTP to verify'}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none text-center text-xl tracking-widest"
                  style={inputStyle}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateEmail}
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                    style={{ backgroundColor: '#D4AF37' }}
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                  <button
                    onClick={() => handleSendOTP('email')}
                    disabled={loading}
                    className="px-4 py-3 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ border: `1px solid ${cardBorder}`, color: textSecondary }}
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Update Password */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <h2 className="text-lg font-bold mb-1" style={{ color: textPrimary }}>Password</h2>
          <p className="text-sm mb-4" style={{ color: textSecondary }}>An OTP will be sent to your email to verify the change</p>

          <div className="flex flex-col gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none"
              style={inputStyle}
            />
            {!otpSent || otpFor !== 'password' ? (
              <button
                onClick={() => handleSendOTP('password')}
                disabled={loading || !newPassword}
                className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ border: '1px solid #D4AF37', color: '#D4AF37' }}
              >
                {loading && otpFor === 'password' ? 'Sending...' : 'Send OTP to verify'}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none text-center text-xl tracking-widest"
                  style={inputStyle}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                    style={{ backgroundColor: '#D4AF37' }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => handleSendOTP('password')}
                    disabled={loading}
                    className="px-4 py-3 rounded-lg text-sm transition-all hover:opacity-80"
                    style={{ border: `1px solid ${cardBorder}`, color: textSecondary }}
                  >
                    Resend OTP
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6 rounded-xl" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: textPrimary }}>Account Info</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span style={{ color: textSecondary }}>Role</span>
              <span
                className="px-3 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: user?.role === 'owner' ? '#1a2a1a' : '#1a1a2a',
                  color: user?.role === 'owner' ? '#22c55e' : '#818cf8',
                  border: `1px solid ${user?.role === 'owner' ? '#22c55e' : '#818cf8'}`
                }}
              >
                {user?.role === 'owner' ? '🏋️ Owner' : '🏃 Seeker'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: textSecondary }}>Member since</span>
              <span style={{ color: textPrimary }}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : 'N/A'}
              </span>
            </div>
            {user?.role === 'seeker' && (
              <div className="flex justify-between items-center">
                <span style={{ color: textSecondary }}>Active Memberships</span>
                <span className="font-bold" style={{ color: '#D4AF37' }}>
                  {memberships.filter(m => !isExpired(m.endDate)).length}
                </span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings