import { useEffect, useState } from 'react'
import api from '../api'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'

const Card = ({children, className = ''}) => (
  <div className={`glass-card p-6 ${className}`}>{children}</div>
)

const Strategy = () => {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [extraPayment, setExtraPayment] = useState(0)
  const [showFullSchedule, setShowFullSchedule] = useState(false)

  const fetchStrategies = async (extra = 0) => {
    try {
      setLoading(true)
      const res = await api.get(`/strategy?extraPayment=${extra}`)
      setResult(res.data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Failed to load strategies')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchStrategies(0) }, [])

  if (loading) return <div className="p-8 text-white">Loading strategist...</div>
  if (error) return <div className="p-8 text-red-400">{error}</div>

  const formatCurrency = (n) => {
    if (n == null) return '—'
    return `₹${Number(n).toLocaleString()}`
  }

  const { recommendedStrategy, interestSavedEstimate, snowball, avalanche } = result || {}

  const renderDebtRow = (d) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-800">
      <div>
        <div className="font-medium">{d.loanName}</div>
        <div className="text-[12px] text-slate-400">{d.id}</div>
      </div>
      <div className="text-right">
        <div className="text-sm">₹{Number(d.remainingBalance || d.amount).toLocaleString()}</div>
        <div className="text-[12px] text-slate-400">{d.interestRate}% • ₹{Number(d.minimumPayment).toLocaleString()}</div>
      </div>
    </div>
  )

  // build comparison chart data from monthly schedules
  const chartData = []
  const sSched = snowball?.monthlySchedule || []
  const aSched = avalanche?.monthlySchedule || []
  const maxMonths = Math.max(sSched.length, aSched.length)
  for (let i = 0; i < maxMonths; i++) {
    chartData.push({
      month: i + 1,
      snowballRemaining: sSched[i]?.totalRemaining ?? null,
      avalancheRemaining: aSched[i]?.totalRemaining ?? null,
      snowballCumulative: sSched[i]?.cumulativeInterest ?? null,
      avalancheCumulative: aSched[i]?.cumulativeInterest ?? null,
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Payoff Strategist</h1>
          <p className="text-slate-400">Compare Snowball vs Avalanche and pick the best approach.</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="number"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-36 bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-white focus:outline-none"
            placeholder="Extra monthly ₹"
          />
          <button onClick={() => fetchStrategies(extraPayment)} className="premium-gradient px-4 py-2 rounded-xl text-white">Recompute</button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Recommended approach</h3>
          <div className="text-2xl font-extrabold text-white">{recommendedStrategy}</div>
          <p className="text-slate-400 mt-3 text-sm">We recommend this approach based on estimated interest savings.</p>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Interest saved estimate</h3>
          <div className="text-2xl font-extrabold text-white">{formatCurrency(interestSavedEstimate)}</div>
          <p className="text-slate-400 mt-3 text-sm">Estimated savings comparing Snowball vs Avalanche.</p>
        </Card>

        <Card>
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Debt payoff sequence</h3>
          <div className="text-sm text-slate-200 mb-2">Recommended sequence for {recommendedStrategy}</div>
          <div className="divide-y divide-slate-800">
            {(recommendedStrategy === 'Avalanche' ? avalanche?.orderedDebts : snowball?.orderedDebts || []).map((d, i) => (
              <div key={d.id} className="py-2 flex justify-between">
                <div className="text-sm">{i+1}. {d.loanName}</div>
                <div className="text-sm text-slate-400">₹{Number(d.remainingBalance || d.amount).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <h3 className="text-lg font-bold mb-4">Remaining balance over time</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="snowballRemaining" stroke="#06b6d4" dot={false} name="Snowball Remaining" />
                <Line type="monotone" dataKey="avalancheRemaining" stroke="#7c3aed" dot={false} name="Avalanche Remaining" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold mb-4">Cumulative interest paid</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="snowballCumulative" stroke="#06b6d4" dot={false} name="Snowball Interest" />
                <Line type="monotone" dataKey="avalancheCumulative" stroke="#7c3aed" dot={false} name="Avalanche Interest" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Snowball Amortization</h3>
            <div className="text-sm text-slate-400">Months: {snowball?.totalMonths} • Interest: {formatCurrency(snowball?.totalInterest)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Total Remaining</th>
                  <th className="px-4 py-2">Interest This Month</th>
                  <th className="px-4 py-2">Cumulative Interest</th>
                </tr>
              </thead>
              <tbody>
                {(snowball?.monthlySchedule || []).slice(0, showFullSchedule ? undefined : 12).map(m => (
                  <tr key={m.month} className="border-t border-slate-800">
                    <td className="px-4 py-2">{m.month}</td>
                    <td className="px-4 py-2">{formatCurrency(m.totalRemaining)}</td>
                    <td className="px-4 py-2">{formatCurrency(m.interestThisMonth)}</td>
                    <td className="px-4 py-2">{formatCurrency(m.cumulativeInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          { (snowball?.monthlySchedule || []).length > 12 && (
            <div className="mt-3">
              <button onClick={() => setShowFullSchedule(!showFullSchedule)} className="px-4 py-2 border border-slate-800 rounded-xl text-sm">{showFullSchedule ? 'Show less' : 'Show all'}</button>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Avalanche Amortization</h3>
            <div className="text-sm text-slate-400">Months: {avalanche?.totalMonths} • Interest: {formatCurrency(avalanche?.totalInterest)}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="px-4 py-2">Month</th>
                  <th className="px-4 py-2">Total Remaining</th>
                  <th className="px-4 py-2">Interest This Month</th>
                  <th className="px-4 py-2">Cumulative Interest</th>
                </tr>
              </thead>
              <tbody>
                {(avalanche?.monthlySchedule || []).slice(0, showFullSchedule ? undefined : 12).map(m => (
                  <tr key={m.month} className="border-t border-slate-800">
                    <td className="px-4 py-2">{m.month}</td>
                    <td className="px-4 py-2">{formatCurrency(m.totalRemaining)}</td>
                    <td className="px-4 py-2">{formatCurrency(m.interestThisMonth)}</td>
                    <td className="px-4 py-2">{formatCurrency(m.cumulativeInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Strategy
