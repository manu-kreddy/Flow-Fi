import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api' // Centralized api
import { User, Mail, Lock, UserPlus, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        passwordHash: formData.password
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError('Registration failed. This email might already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md glass-card p-10 z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 premium-gradient rounded-2xl shadow-xl shadow-primary-500/20 mb-4">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-400 text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Account created! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="text"
                name="name"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="email"
                name="email"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
              <input
                type="password"
                name="password"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-gradient text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
