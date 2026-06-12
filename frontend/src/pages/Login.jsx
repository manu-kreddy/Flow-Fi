import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, Lock, LogIn, Sparkles, AlertCircle } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(
        'http://localhost:8080/auth/login',
        { email, password }
      );
      
      const { token, userId, name } = response.data;
      
      if (token) {
        // Atomic storage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('name', name);
        
        // Use replace to prevent going back to login
        navigate('/dashboard', { replace: true });
      } else {
        setError('Login failed: Token not received.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md glass-card p-10 z-10 relative">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 premium-gradient rounded-2xl shadow-xl shadow-primary-500/20 mb-4">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-gradient text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
