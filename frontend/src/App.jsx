import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import DebtLedger from './pages/DebtLedger'
import Strategy from './pages/Strategy'
import Simulator from './pages/Simulator'
import AIAdvisor from './pages/AIAdvisor'
import FreedomLadder from './pages/FreedomLadder'
import Debts from './pages/Debts'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import DebtDoctor from './pages/DebtDoctor'
import GameProfile from './pages/GameProfile'
import { XPProvider } from './components/XPNotificationContext'

function App() {
  return (
    <XPProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes with Sidebar Layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex w-full overflow-hidden h-screen">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950">
                      <div className="max-w-7xl mx-auto">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/ledger" element={<DebtLedger />} />
                          <Route path="/debts" element={<Debts />} />
                          <Route path="/strategy" element={<Strategy />} />
                          <Route path="/simulator" element={<Simulator />} />
                          <Route path="/advisor" element={<AIAdvisor />} />
                          <Route path="/ladder" element={<FreedomLadder />} />
                          <Route path="/debt-doctor" element={<DebtDoctor />} />
                          <Route path="/game" element={<GameProfile />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </div>
                    </main>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </XPProvider>
  )
}

export default App
