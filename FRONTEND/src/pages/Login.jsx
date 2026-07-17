import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { login } from '../store/authslice';
import { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useTheme } from '../context/ThemeContext'


const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(1, "Password is required")
});

function Login() {
  const { theme } = useTheme()
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setError(null);
      const response = await axiosInstance.post('/auth/login', data);
      dispatch(login(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5' }}>

      {/* Left Side — Image + Quote */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
          alt="gym"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#D4AF37' }}>
            GymFinder
          </h1>
          <p className="text-xl text-gray-300 mb-2">Find your perfect gym.</p>
          <p className="text-gray-400">Discover elite fitness centers near you.</p>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Logo for mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: '#D4AF37' }}>GymFinder</h1>
          </div>
          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px" style={{ backgroundColor: '#333' }}></div>
            <span className="text-sm" style={{ color: '#666' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#333' }}></div>
          </div>

          {/* Google Login */}
          <a
            href="http://localhost:3000/api/auth/google"
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-3 transition-all hover:opacity-90"
            style={{ backgroundColor: '#fff', color: '#333' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </a>

          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 mb-8">Sign in to continue your fitness journey</p>

          {error && (
            <div className="border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: '#1a1a1a',
                  borderColor: errors.emailId ? '#ef4444' : '#333',
                  focusBorderColor: '#D4AF37'
                }}
                {...register('emailId')}
              />
              {errors.emailId && (
                <p className="text-red-400 text-sm mt-1">{errors.emailId.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 border focus:outline-none focus:ring-2 transition-all pr-12"
                  style={{
                    backgroundColor: '#1a1a1a',
                    borderColor: errors.password ? '#ef4444' : '#333',
                  }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-black transition-all hover:opacity-90 mt-2"
              style={{ backgroundColor: '#D4AF37' }}
            >
              Sign In
            </button>

          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Don't have an account?{' '}
            <NavLink to="/register" className="font-medium hover:opacity-80 transition-colors" style={{ color: '#D4AF37' }}>
              Create account
            </NavLink>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login;