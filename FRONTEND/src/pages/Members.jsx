import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { useTheme } from '../context/ThemeContext'

const Members = () => {
  const { gymId } = useParams()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [gymName, setGymName] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', address: '',
    subscriptionType: 'monthly', startDate: ''
  })

  const bg = theme === 'dark' ? '#00050f' : '#f0f5ff'
  const cardBg = theme === 'dark' ? '#001525' : '#ffffff'
  const cardBorder = theme === 'dark' ? '#003060' : '#b0c8ff'
  const textPrimary = theme === 'dark' ? '#ffffff' : '#111111'
  const textSecondary = theme === 'dark' ? '#9ca3af' : '#6b7280'
  const inputBg = theme === 'dark' ? '#00000f' : '#f0f0ff'
  const inputBorder = theme === 'dark' ? '#1a1a5a' : '#c0c0ff'
  const inputStyle = { backgroundColor: inputBg, borderColor: inputBorder, color: textPrimary }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, gymRes] = await Promise.all([
          axiosInstance.get(`/members/${gymId}`),
          axiosInstance.get(`/gyms/${gymId}`)
        ])
        setMembers(membersRes.data.members)
        setGymName(gymRes.data.gym.title)
      } catch (err) {
        setError('Failed to fetch members')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [gymId])

  const handleAddMember = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await axiosInstance.post(`/members/${gymId}`, form)
      setMembers([response.data.member, ...members])
      setShowForm(false)
      setForm({ name: '', phone: '', address: '', subscriptionType: 'monthly', startDate: '' })
    } catch (err) {
      setError('Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memberId) => {
    if (!window.confirm('Remove this member?')) return
    try {
      await axiosInstance.delete(`/members/${memberId}`)
      setMembers(members.filter(m => m._id !== memberId))
    } catch (err) {
      setError('Failed to remove member')
    }
  }

  const getSubscriptionLabel = (type) => {
    const labels = {
      monthly: '1 Month', '3months': '3 Months',
      '6months': '6 Months', yearly: '1 Year'
    }
    return labels[type] || type
  }

  const getSubscriptionColor = (type) => {
    const colors = {
      monthly: '#60a5fa', '3months': '#a78bfa',
      '6months': '#34d399', yearly: '#D4AF37'
    }
    return colors[type] || '#888'
  }

  const isExpired = (endDate) => new Date(endDate) < new Date()

  const inputStyle = {
    backgroundColor: inputBg,
    borderColor: inputBorder,
    color: textPrimary
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: bg }}>
      <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>

      {/* Header */}
      <div className="px-8 py-8" style={{ borderBottom: `1px solid ${cardBorder}` }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm mb-2 flex items-center gap-1 transition-all hover:opacity-70"
              style={{ color: '#D4AF37' }}
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold" style={{ color: textPrimary }}>Members</h1>
            <p className="mt-1" style={{ color: textSecondary }}>{gymName} — {members.length} total members</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
            style={{ backgroundColor: '#D4AF37' }}
          >
            + Add Member
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10">

        {error && (
          <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
        )}

        {/* Add Member Form */}
        {showForm && (
          <div
            className="p-6 rounded-xl mb-8"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Add New Member</h2>
            <form onSubmit={handleAddMember} className="grid grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Phone Number</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Address</label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: textSecondary }}>Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-3" style={{ color: textSecondary }}>Subscription Type</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'monthly', label: '1 Month' },
                    { value: '3months', label: '3 Months' },
                    { value: '6months', label: '6 Months' },
                    { value: 'yearly', label: '1 Year' }
                  ].map((sub) => (
                    <button
                      key={sub.value}
                      type="button"
                      onClick={() => setForm({ ...form, subscriptionType: sub.value })}
                      className="py-3 rounded-lg text-sm font-medium transition-all"
                      style={{
                        backgroundColor: form.subscriptionType === sub.value ? '#D4AF37' : cardBg,
                        color: form.subscriptionType === sub.value ? '#000' : getSubscriptionColor(sub.value),
                        border: `1px solid ${getSubscriptionColor(sub.value)}`
                      }}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg font-bold text-black transition-all hover:opacity-90"
                  style={{ backgroundColor: '#D4AF37' }}
                >
                  {saving ? 'Adding...' : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-lg font-bold transition-all hover:opacity-80"
                  style={{ border: `1px solid ${cardBorder}`, color: textSecondary }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Members', value: members.length, color: '#D4AF37' },
            { label: 'Active', value: members.filter(m => !isExpired(m.endDate)).length, color: '#22c55e' },
            { label: 'Expired', value: members.filter(m => isExpired(m.endDate)).length, color: '#ef4444' },
            { label: 'Yearly', value: members.filter(m => m.subscriptionType === 'yearly').length, color: '#a78bfa' }
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl text-center"
              style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
            >
              <p className="text-sm mb-1" style={{ color: textSecondary }}>{stat.label}</p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Members Table */}
        {members.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <p className="text-5xl mb-4">👥</p>
            <p className="text-xl font-bold mb-2" style={{ color: textPrimary }}>No members yet</p>
            <p style={{ color: textSecondary }}>Add your first member using the button above</p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  {['Name', 'Phone', 'Subscription', 'Start Date', 'End Date', 'Status', ''].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-sm font-medium"
                      style={{ color: textSecondary }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr
                    key={member._id}
                    style={{ borderBottom: `1px solid ${cardBorder}` }}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium" style={{ color: textPrimary }}>{member.name}</p>
                        {member.address && (
                          <p className="text-xs mt-0.5" style={{ color: textSecondary }}>{member.address}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`tel:${member.phone}`}
                        className="text-sm hover:text-yellow-400 transition-colors"
                        style={{ color: textPrimary }}
                      >
                        {member.phone}
                      </a>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getSubscriptionColor(member.subscriptionType)}22`,
                          color: getSubscriptionColor(member.subscriptionType),
                          border: `1px solid ${getSubscriptionColor(member.subscriptionType)}`
                        }}
                      >
                        {getSubscriptionLabel(member.subscriptionType)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {new Date(member.startDate).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm" style={{ color: textPrimary }}>
                        {new Date(member.endDate).toLocaleDateString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: isExpired(member.endDate) ? '#ef444422' : '#22c55e22',
                          color: isExpired(member.endDate) ? '#ef4444' : '#22c55e',
                          border: `1px solid ${isExpired(member.endDate) ? '#ef4444' : '#22c55e'}`
                        }}
                      >
                        {isExpired(member.endDate) ? 'Expired' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Members