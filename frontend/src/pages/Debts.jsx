import { useState, useEffect } from 'react'
import api from '../api' // Centralized api
import { Plus, Edit2, Trash2, X, Check, Search, Filter } from 'lucide-react'

const Debts = () => {
  const [debts, setDebts] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [formData, setFormData] = useState({ loanName: '', lenderName: '', principalAmount: '', remainingAmount: '', interestRate: '', monthlyEMI: '', dueDate: '' })
  
  const fetchDebts = async () => {
    try {
      const res = await api.get('/debts')
      setDebts(res.data)
    } catch (err) {
      console.error('Failed to fetch debts', err)
    }
  }

  useEffect(() => { fetchDebts() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        loanName: formData.loanName,
        lenderName: formData.lenderName,
        principalAmount: formData.principalAmount ? parseFloat(formData.principalAmount) : 0,
        remainingAmount: formData.remainingAmount ? parseFloat(formData.remainingAmount) : (formData.principalAmount ? parseFloat(formData.principalAmount) : 0),
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
        monthlyEMI: formData.monthlyEMI ? parseFloat(formData.monthlyEMI) : 0,
        dueDate: formData.dueDate || null
      }

      if (editingDebt) {
        await api.put(`/debts/${editingDebt.id}`, payload)
      } else {
        await api.post('/debts', payload)
      }
      setIsModalOpen(false)
      setEditingDebt(null)
      setFormData({ loanName: '', lenderName: '', principalAmount: '', remainingAmount: '', interestRate: '', monthlyEMI: '', dueDate: '' })
      fetchDebts()
    } catch (err) {
      console.error('Operation failed', err)
    }
  }

  const handleDelete = async (id) => {
      if (confirm('Are you sure you want to delete this debt?')) {
      await api.delete(`/debts/${id}`)
      fetchDebts()
    }
  }

  const openEditModal = (debt) => {
    setEditingDebt(debt)
    setFormData({ 
      loanName: debt.loanName || '',
      lenderName: debt.lenderName || '',
      principalAmount: debt.principalAmount ?? debt.amount ?? '',
      remainingAmount: debt.remainingAmount ?? debt.remainingBalance ?? '',
      interestRate: debt.interestRate ?? '',
      monthlyEMI: debt.monthlyEMI ?? debt.minimumPayment ?? '',
      dueDate: debt.dueDate ? String(debt.dueDate) : ''
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Debt Ledger</h1>
          <p className="text-slate-400">Everything you owe, organized in one place</p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setEditingDebt(null); }}
          className="premium-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Debt
        </button>
      </header>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <div className="relative group w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary-400" />
            <input 
              type="text" 
              placeholder="Search loans..." 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-widest font-bold">
                  <th className="px-8 py-5">Loan Name</th>
                  <th className="px-8 py-5">Remaining</th>
                  <th className="px-8 py-5">EMI</th>
                  <th className="px-8 py-5">Interest Rate</th>
                  <th className="px-8 py-5">Due Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
          <tbody className="divide-y divide-slate-800">
            {debts.map((debt) => (
              <tr key={debt.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-8 py-5 font-medium text-white">{debt.loanName}</td>
                <td className="px-8 py-5 text-slate-300">₹{Number(debt.remainingAmount ?? debt.remainingBalance ?? 0).toLocaleString()}</td>
                <td className="px-8 py-5 text-slate-300">₹{Number(debt.monthlyEMI ?? debt.minimumPayment ?? 0).toLocaleString()}</td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-xs font-bold ring-1 ring-primary-500/30">
                    {debt.interestRate}%
                  </span>
                </td>
                <td className="px-8 py-5 text-slate-300">{debt.dueDate ?? '-'}</td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(debt)}
                      className="p-2 text-slate-400 hover:text-primary-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(debt.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {debts.length === 0 && (
              <tr>
                <td colSpan="6" className="px-8 py-20 text-center text-slate-500 italic">No debts found. Start by adding one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass-card p-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">{editingDebt ? 'Edit Debt' : 'Add New Debt'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Loan Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  value={formData.loanName}
                  onChange={(e) => setFormData({...formData, loanName: e.target.value})}
                  placeholder="e.g. Student Loan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Lender Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                  value={formData.lenderName}
                  onChange={(e) => setFormData({...formData, lenderName: e.target.value})}
                  placeholder="e.g. Bank of Example"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Amount (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    value={formData.principalAmount}
                    onChange={(e) => setFormData({...formData, principalAmount: e.target.value})}
                    placeholder="Principal amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Interest Rate (%)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                    placeholder="e.g. 7.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Minimum Monthly Payment (₹)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    value={formData.monthlyEMI}
                    onChange={(e) => setFormData({...formData, monthlyEMI: e.target.value})}
                    placeholder="Minimum monthly EMI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-800 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 premium-gradient text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Debts
