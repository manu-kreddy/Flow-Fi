import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api' 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { 
  Wallet, 
  Calendar, 
  TrendingDown, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Zap,
  ChevronRight
} from 'lucide-react'

const Dashboard = () => {
  const [debts, setDebts] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch debts (current user) and dashboard summary (use API prefix)
        const [debtsRes, dashRes] = await Promise.all([
          api.get('/debts'),
          api.get('/api/dashboard')
        ]);

        setDebts(debtsRes.data || []);
        setSummary(dashRes.data || null);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const safeNum = (v) => (v == null || isNaN(Number(v)) ? 0 : Number(v))
  const totalDebt = safeNum(summary?.totalDebt) || debts.reduce((acc, d) => acc + safeNum(d.remainingAmount ?? d.remainingBalance ?? d.amount), 0)
  const totalEMI = safeNum(summary?.totalEMI) || debts.reduce((acc, d) => acc + safeNum(d.monthlyEMI ?? d.minimumPayment), 0)
  const chartData = debts.map(d => ({ name: d.loanName || 'Loan', value: safeNum(d.remainingAmount ?? d.remainingBalance ?? d.amount) })).filter(e => e.value > 0)

  // Repayment progress per loan (percent paid)
  const progressData = debts.map(d => {
    const principal = safeNum(d.principalAmount ?? d.amount)
    const remaining = safeNum(d.remainingAmount ?? d.remainingBalance ?? d.amount)
    const paidPct = principal > 0 ? Math.max(0, Math.min(100, Math.round(((principal - remaining) / principal) * 10000) / 100)) : 0
    return { name: d.loanName || 'Loan', percent: paidPct, id: d.id }
  }).filter(d => !isNaN(d.percent)).sort((a,b) => b.percent - a.percent)

  const formatCurrency = (n) => {
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(safeNum(n))
    } catch (e) {
      return `₹${Math.round(safeNum(n)).toLocaleString()}`
    }
  }
  const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b']

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="glass-card p-10 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-4">Dashboard Error</h2>
          <p className="text-slate-400 mb-8 font-mono text-sm bg-slate-900 p-4 rounded-lg break-all">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="premium-gradient text-white px-8 py-3 rounded-xl font-bold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  if (!loading && !error && debts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="glass-card p-10 max-w-lg text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No debts yet</h2>
          <p className="text-slate-400 mb-6">Add your first debt to begin tracking.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/debts')} className="premium-gradient text-white px-6 py-3 rounded-xl font-bold">Add Your First Debt</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Financial Overview</h1>
          <p className="text-slate-400">Total control over your {debts.length} active loans</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-slate-400 font-medium">Total Debt</span>
          </div>
          <h2 className="text-3xl font-bold text-white">₹{(summary?.totalDebt ?? totalDebt).toLocaleString()}</h2>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-slate-400 font-medium">Monthly EMI</span>
          </div>
          <h2 className="text-3xl font-bold text-white">₹{(summary?.totalEMI ?? 0).toLocaleString()}</h2>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-slate-400 font-medium">Number of Loans</span>
          </div>
          <h2 className="text-3xl font-bold text-white">{summary?.loanCount ?? debts.length}</h2>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-slate-400 font-medium">Debt Free Progress</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden">
              <div className="h-4 bg-emerald-400" style={{ width: `${summary?.progressPercentage ?? 0}%` }} />
            </div>
            <p className="text-slate-400 text-sm mt-3">{summary?.progressPercentage ?? 0}% paid</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-8">Debt Distribution</h3>
          <div className="h-[400px] w-full">
            {debts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>No debt data available</p>
              </div>
            )}
          </div>
        </div>
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-white mb-6">Repayment Progress</h3>
          {progressData.length > 0 ? (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} layout="vertical" margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0b1220" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={160} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="percent" fill="#10b981" radius={[6,6,6,6]} onClick={(d) => navigate('/debts')}>
                    {/* bars rendered automatically */}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-slate-400 text-sm mt-4">Click a bar to view your debts.</p>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-500">No progress data</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
