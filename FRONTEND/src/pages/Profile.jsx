import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { useTheme } from '../context/ThemeContext'

const getPlanLabel = (type) => ({
  monthly: '1 Month', '3months': '3 Months',
  '6months': '6 Months', yearly: '1 Year'
}[type] || type)

const Profile = () => {
  const { user } = useSelector((state) => state.auth)
  const { theme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [profile, setProfile] = useState({
    height: '', weight: '', age: '', gender: '',
    fitnessGoal: '', fitnessLevel: '', workoutFrequency: ''
  })
  const [bmi, setBmi] = useState(null)

  const bg = theme === 'dark' ? '#05000f' : '#f5f0ff'
  const cardBg = theme === 'dark' ? '#150030' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#3a0070' : '#d5c0ff'  // ← more visible border
  const inputBg = theme === 'dark' ? '#05000f' : '#f9f9ff'    // ← add this
  const inputBorder = theme === 'dark' ? '#3a0070' : '#d5c0ff' // ← add this
  const textPrimary = theme === 'dark' ? '#f8fafc' : '#0f172a'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#64748b'
  const chipBg = theme === 'dark' ? '#1f2937' : '#e2e8f0'
  const chipText = theme === 'dark' ? '#fbbf24' : '#1d4ed8'
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, memberRes] = await Promise.all([
          axiosInstance.get('/users/profile'),
          user?.role === 'seeker' ? axiosInstance.get('/members/my-memberships') : Promise.resolve({ data: { members: [] } })
        ])
        const u = profileRes.data.user
        setProfile({
          height: u.height || '', weight: u.weight || '',
          age: u.age || '', gender: u.gender || '',
          fitnessGoal: u.fitnessGoal || '', fitnessLevel: u.fitnessLevel || '',
          workoutFrequency: u.workoutFrequency || ''
        })
        if (u.bmi) setBmi(u.bmi)
        setMemberships(memberRes.data.members || [])
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (profile.height && profile.weight) {
      const h = parseFloat(profile.height) / 100
      const w = parseFloat(profile.weight)
      if (h > 0 && w > 0) setBmi(parseFloat((w / (h * h)).toFixed(1)))
    }
  }, [profile.height, profile.weight])

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' }
    if (bmi < 25) return { label: 'Normal', color: '#22c55e' }
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' }
    return { label: 'Obese', color: '#ef4444' }
  }

  const handleCancelMembership = async (memberId) => {
    if (!window.confirm('Cancel this membership?')) return
    try {
      await axiosInstance.delete(`/members/cancel/${memberId}`)
      setMemberships(memberships.filter(m => m._id !== memberId))
    } catch (err) {
      setError('Failed to cancel membership')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await axiosInstance.put('/users/profile', profile)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const isExpired = (endDate) => new Date(endDate) < new Date()

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: bg }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const bmiCategory = bmi ? getBmiCategory(bmi) : null
  const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-8 py-8" style={{ borderBottom: `1px solid ${cardBorder}` }}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-black text-2xl"
            style={{ backgroundColor: '#D4AF37' }}
          >
            {user?.firstName?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>{user?.firstName}</h1>
            <p style={{ color: textSecondary }}>{user?.emailId}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{
                backgroundColor: user?.role === 'owner' ? '#1a2a1a' : '#1a1a2a',
                color: user?.role === 'owner' ? '#22c55e' : '#818cf8',
                border: `1px solid ${user?.role === 'owner' ? '#22c55e' : '#818cf8'}`
              }}
            >
              {user?.role === 'owner' ? '🏋️ Owner' : '🏃 Seeker'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">

        {/* My Memberships — seeker only */}
        {user?.role === 'seeker' && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4" style={{ color: textPrimary }}>My Memberships</h2>

            {memberships.length === 0 ? (
              <div
                className="text-center py-10 rounded-xl"
                style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <p className="text-4xl mb-3">🏋️</p>
                <p className="mb-4" style={{ color: textSecondary }}>No active memberships yet</p>
                <NavLink
                  to="/"
                  className="px-6 py-2 rounded-lg font-bold text-black transition-all hover:opacity-90"
                  style={{ backgroundColor: '#D4AF37' }}
                >
                  Browse Gyms
                </NavLink>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {memberships.map((m) => (
                  <div
                    key={m._id}
                    className="p-5 rounded-xl"
                    style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        {/* Gym Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: theme === 'dark' ? '#2a2a2a' : '#e5e5e5' }}>
                          {m.gymId?.images?.length > 0 ? (
                            <img src={m.gymId.images[0]} alt={m.gymId.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🏋️</div>
                          )}
                        </div>

                        <div>
                          <NavLink to={`/gym/${m.gymId?._id}`}>
                            <h3 className="font-bold text-lg hover:text-yellow-400 transition-colors" style={{ color: textPrimary }}>
                              {m.gymId?.title}
                            </h3>
                          </NavLink>
                          <p className="text-sm" style={{ color: textSecondary }}>📍 {m.gymId?.address}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{ backgroundColor: '#D4AF3722', color: '#D4AF37', border: '1px solid #D4AF37' }}
                            >
                              {getPlanLabel(m.subscriptionType)}
                            </span>
                            <span
                              className="text-xs px-3 py-1 rounded-full font-medium"
                              style={{
                                backgroundColor: isExpired(m.endDate) ? '#ef444422' : '#22c55e22',
                                color: isExpired(m.endDate) ? '#ef4444' : '#22c55e',
                                border: `1px solid ${isExpired(m.endDate) ? '#ef4444' : '#22c55e'}`
                              }}
                            >
                              {isExpired(m.endDate) ? 'Expired' : 'Active'}
                            </span>
                          </div>
                          <p className="text-xs mt-2" style={{ color: textSecondary }}>
                            Valid: {new Date(m.startDate).toLocaleDateString('en-IN')} → {new Date(m.endDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelMembership(m._id)}
                        className="text-sm px-4 py-2 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
                        style={{ border: '1px solid #ef4444', color: '#ef4444' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BMI Card */}
        {bmi && (
          <div
            className="p-6 rounded-xl mb-8 flex items-center justify-between"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div>
              <p className="text-sm mb-1" style={{ color: textSecondary }}>Your BMI</p>
              <p className="text-5xl font-bold" style={{ color: '#D4AF37' }}>{bmi}</p>
              <p className="text-sm mt-1 font-medium" style={{ color: bmiCategory.color }}>{bmiCategory.label}</p>
            </div>
            <div className="text-right">
              <p className="text-sm mb-2" style={{ color: textSecondary }}>BMI Scale</p>
              <div className="flex flex-col gap-1 text-xs">
                <span style={{ color: '#60a5fa' }}>{'< 18.5'} Underweight</span>
                <span style={{ color: '#22c55e' }}>18.5 - 24.9 Normal</span>
                <span style={{ color: '#f59e0b' }}>25 - 29.9 Overweight</span>
                <span style={{ color: '#ef4444' }}>{'≥ 30'} Obese</span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
        {success && <div className="border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">✅ Profile saved!</div>}

        {/* Fitness Profile Form */}
        <h2 className="text-2xl font-bold mb-6" style={{ color: textPrimary }}>Fitness Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Height (cm)</label>
              <input type="number" placeholder="175" value={profile.height}
                onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Weight (kg)</label>
              <input type="number" placeholder="70" value={profile.weight}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Age</label>
              <input type="number" placeholder="25" value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Gender</label>
              <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border focus:outline-none" style={inputStyle}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Fitness Goal</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'bulk', label: 'Bulk', emoji: '💪', desc: 'Build muscle mass' },
                { value: 'fit', label: 'Fit', emoji: '🏃', desc: 'Stay active & healthy' },
                { value: 'lean', label: 'Lean', emoji: '🔥', desc: 'Burn fat & tone up' }
              ].map((goal) => (
                <button key={goal.value} type="button"
                  onClick={() => setProfile({ ...profile, fitnessGoal: goal.value })}
                  className="p-4 rounded-xl border transition-all text-center"
                  style={{
                    backgroundColor: profile.fitnessGoal === goal.value ? '#D4AF37' : cardBg,
                    borderColor: profile.fitnessGoal === goal.value ? '#D4AF37' : cardBorder,
                    color: profile.fitnessGoal === goal.value ? '#000' : textPrimary
                  }}>
                  <p className="text-2xl mb-1">{goal.emoji}</p>
                  <p className="font-bold text-sm">{goal.label}</p>
                  <p className="text-xs mt-1 opacity-70">{goal.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Fitness Level</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Just starting out' },
                { value: 'intermediate', label: 'Intermediate', emoji: '⚡', desc: '1-3 years experience' },
                { value: 'advanced', label: 'Advanced', emoji: '🏆', desc: '3+ years experience' }
              ].map((level) => (
                <button key={level.value} type="button"
                  onClick={() => setProfile({ ...profile, fitnessLevel: level.value })}
                  className="p-4 rounded-xl border transition-all text-center"
                  style={{
                    backgroundColor: profile.fitnessLevel === level.value ? '#D4AF37' : cardBg,
                    borderColor: profile.fitnessLevel === level.value ? '#D4AF37' : cardBorder,
                    color: profile.fitnessLevel === level.value ? '#000' : textPrimary
                  }}>
                  <p className="text-2xl mb-1">{level.emoji}</p>
                  <p className="font-bold text-sm">{level.label}</p>
                  <p className="text-xs mt-1 opacity-70">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>
              Workout Frequency — {profile.workoutFrequency || 0} days/week
            </label>
            <input type="range" min="1" max="7" value={profile.workoutFrequency || 3}
              onChange={(e) => setProfile({ ...profile, workoutFrequency: e.target.value })}
              className="w-full accent-yellow-500" />
            <div className="flex justify-between text-xs mt-1" style={{ color: textSecondary }}>
              <span>1 day</span><span>4 days</span><span>7 days</span>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-4 rounded-xl font-bold text-black text-lg transition-all hover:opacity-90 mt-2"
            style={{ backgroundColor: '#D4AF37' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile