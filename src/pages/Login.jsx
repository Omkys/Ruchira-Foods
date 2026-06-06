import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ChefHat, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import AuthLayout from '../layouts/AuthLayout'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Login() {
  const { user, loading, signIn } = useAuth()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signIn(email, password)
      addToast('Welcome back!', 'success')
    } catch (err) {
      addToast(err.message || 'Login failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
        <div className="rounded-lg bg-primary-600 p-2 text-white">
          <ChefHat size={24} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Ruchira Foods Admin</h1>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to access the dashboard
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="admin@restaurant.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </AuthLayout>
  )
}
