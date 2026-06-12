import { useState, useEffect } from 'react'
import api from '../api' // Centralized api
import { Zap, TrendingDown, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

const Simulator = () => {
  const [formData, setFormData] = useState({ loanId: '', extraPayment: 0, purchaseAmount: 0 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [debts, setDebts] = useState([])
  
  const handleSimulate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { loanId: formData.loanId, extraPayment: Number(formData.extraPayment) }
      const res = await api.post('/api/simulation', payload)
      setResult(res.data)
    } catch (err) {
      console.error('Simulation failed', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/debts')
        setDebts(res.data || [])
        if ((res.data || []).length > 0) setFormData((f) => ({ ...f, loanId: res.data[0].id }))
      } catch (e) {
        console.error('Failed to load debts', e)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-bold text-white mb-2">Impact Simulator</h1>
        <p className="text-slate-400">See how your choices today affect your financial tomorrow</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
              <Zap className="text-primary-400" />
              Adjust Scenarios
            </h3>
            
            <form onSubmit={handleSimulate} className="space-y-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Select Loan</label>
                  <select value={formData.loanId} onChange={(e) => setFormData({...formData, loanId: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white">
                    {debts.length === 0 && <option value="">(no loans)</option>}
                    {debts.map(d => (
                      <option key={d.id} value={d.id}>{d.loanName} — ₹{(d.remainingAmount ?? d.remainingBalance ?? d.amount ?? 0).toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-medium text-slate-300">Monthly Extra Payment</label>
                  <span className="text-primary-400 font-bold">₹{formData.extraPayment.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="500"
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  value={formData.extraPayment}
                  onChange={(e) => setFormData({...formData, extraPayment: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-medium text-slate-300">New Purchase Amount</label>
                  <span className="text-red-400 font-bold">₹{formData.purchaseAmount.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1000000" 
                  step="1000"
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500/50"
                  value={formData.purchaseAmount}
                  onChange={(e) => setFormData({...formData, purchaseAmount: parseInt(e.target.value)})}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full premium-gradient text-white py-4 rounded-xl font-bold shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                Run Global Simulation
              </button>
            </form>
          </div>
        </div>

        <div>
          {result ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="grid grid-cols-2 gap-6">
                <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Current Payoff</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span className="text-xl font-bold text-white">{result.currentMonths < 0 ? 'N/A' : `${result.currentMonths} months`}</span>
                  </div>
                </div>
                <div className="glass-card p-6 border-l-4 border-l-primary-500">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">With Extra Payment</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary-400" />
                    <span className="text-xl font-bold text-white">{result.newMonths < 0 ? 'Will not amortize' : `${result.newMonths} months`}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="text-sm text-slate-400 mb-2">Interest saved</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-white">₹{Math.max(0, Math.round(result.interestSaved)).toLocaleString()}</span>
                  <span className="text-sm text-slate-400">(Current: ₹{Math.round(result.currentTotalInterest).toLocaleString()} → New: ₹{Math.round(result.newTotalInterest).toLocaleString()})</span>
                </div>
              </div>

              <div className="glass-card p-6">
                <h4 className="text-sm text-slate-400 mb-4">Comparison</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Months', current: result.currentMonths < 0 ? 0 : result.currentMonths, new: result.newMonths < 0 ? 0 : result.newMonths},{name: 'Interest', current: Math.round(result.currentTotalInterest), new: Math.round(result.newTotalInterest)}]}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="current" fill="#64748b" name="Current" />
                      <Bar dataKey="new" fill="#10b981" name="With Extra" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full glass-card border-dashed flex flex-col items-center justify-center p-20 text-center opacity-40">
              <Zap className="w-20 h-20 mb-6 text-slate-800" />
              <h3 className="text-2xl font-bold mb-2">Ready to Simulate</h3>
              <p className="max-w-xs">Select a loan, set an extra monthly payment, and click simulate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Simulator
