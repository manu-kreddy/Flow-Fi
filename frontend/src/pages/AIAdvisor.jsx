import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import { Send, RefreshCw } from 'lucide-react'

const AIAdvisor = () => {
  const [advisor, setAdvisor] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEnd = useRef(null)

  const userId = localStorage.getItem('userId') || 'dev-user'

  useEffect(() => {
    fetchAdvisor()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchAdvisor = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.get(`/api/advisor/${userId}`)
      setAdvisor(res.data)
      // push a system-style assistant message
      setMessages([{ role: 'assistant', content: formatAdvisor(res.data) }])
    } catch (err) {
      console.error('Advisor fetch failed', err)
      setError('Advisor temporarily unavailable. Showing basic suggestions.')
      // basic local summary
      setMessages([{ role: 'assistant', content: 'Unable to reach AI service. Try again later.' }])
    } finally { setLoading(false) }
  }

  const formatAdvisor = (data) => {
    if (!data) return ''
    let out = ''
    out += `Summary: ${data.summary}\n`;
    out += `Risk: ${data.riskLevel}\n\n`;
    if (data.suggestions && data.suggestions.length) {
      out += 'Suggestions:\n'
      data.suggestions.forEach(s => out += `- ${s}\n`)
    }
    if (data.repaymentAdvice && data.repaymentAdvice.length) {
      out += '\nRepayment Advice:\n'
      data.repaymentAdvice.forEach(s => out += `- ${s}\n`)
    }
    return out
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await api.post(`/api/advisor/${userId}/chat`, { message: userMsg.content })
      const assistant = { role: 'assistant', content: res.data.content }
      setMessages(m => [...m, assistant])
    } catch (err) {
      console.error('Chat failed', err)
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, the advisor is unavailable right now.' }])
    } finally { setLoading(false) }
  }

  const handleRefresh = () => fetchAdvisor()

  return (
    <div className="p-8 text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">AI Advisor</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white">
            <RefreshCw className="w-4 h-4 inline" />
          </button>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <p className="text-sm text-slate-400">Personalized financial guidance based on your debts. Use the chat below to ask follow-up questions.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="glass-card p-4 h-[60vh] overflow-y-auto">
            {messages.map((m, idx) => (
              <div key={idx} className={`mb-4 ${m.role === 'assistant' ? 'text-slate-200' : 'text-slate-100'}`}>
                <div className={`inline-block p-3 rounded-xl ${m.role === 'assistant' ? 'bg-slate-800' : 'bg-primary-500/10 text-primary-300'}`}>
                  <pre className="whitespace-pre-wrap text-sm leading-snug">{m.content}</pre>
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the advisor a question..." className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-white" />
            <button disabled={loading} className="p-3 bg-primary-500 rounded-xl text-white flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        <aside className="col-span-1">
          <div className="glass-card p-4 mb-4">
            <h3 className="text-sm font-bold mb-2">Snapshot</h3>
            {advisor ? (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[13px] text-slate-400">Summary</div>
                  <div className="text-sm font-medium">{advisor.summary}</div>
                </div>
                <div>
                  <div className="text-[13px] text-slate-400">Risk</div>
                  <div className="text-sm font-bold text-amber-300">{advisor.riskLevel}</div>
                </div>
                <div>
                  <div className="text-[13px] text-slate-400">Top Suggestion</div>
                  <div className="text-sm">{advisor.suggestions && advisor.suggestions[0]}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">No snapshot available.</div>
            )}
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-bold mb-2">Quick Tips</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>- Prioritize >15% APR loans</li>
              <li>- Keep 3–6 months emergency fund</li>
              <li>- Consider Avalanche for interest savings</li>
            </ul>
          </div>
        </aside>
      </div>

      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
    </div>
  )
}

export default AIAdvisor
