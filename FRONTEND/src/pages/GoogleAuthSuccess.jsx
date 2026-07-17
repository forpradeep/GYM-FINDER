import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../store/authslice'

const GoogleAuthSuccess = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const user = params.get('user')
    if (user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user))
        dispatch(login(parsedUser))
        navigate('/')
      } catch (err) {
        navigate('/login')
      }
    } else {
      navigate('/login')
    }
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Signing you in...</p>
      </div>
    </div>
  )
}

export default GoogleAuthSuccess