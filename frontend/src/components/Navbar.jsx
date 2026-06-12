import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Wallet, TrendingUp, Compass, MessageSquare, LogOut, Trophy, Stethoscope } from 'lucide-react'
import api from '../api'

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('userId');
  
  const [xpProfile, setXpProfile] = useState({ xp: 0, level: 1 });

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Debt Ledger', icon: Wallet, path: '/debts' },
    { name: 'Strategist', icon: TrendingUp, path: '/strategy' },
    { name: 'Freedom Ladder', icon: Compass, path: '/ladder' },
    { name: 'Simulator', icon: Compass, path: '/simulator' },
    { name: 'AI Advisor', icon: MessageSquare, path: '/advisor' },
    { name: 'Game Profile', icon: Trophy, path: '/game' },
    { name: 'Debt Doctor', icon: Stethoscope, path: '/debt-doctor' },
  ]

  useEffect(() => {
    const fetchXp = async () => {
      try {
        if (!userId) return;
        const res = await api.get(`/api/game/profile/${userId}`);
        setXpProfile(res.data);
      } catch (err) {
        console.error('XP fetch failed', err);
      }
    };
    fetchXp();
    const interval = setInterval(fetchXp, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const xpToNext = (level) => [0, 100, 250, 500, 1000, 2000, 5000, 10000][level] || 10000;
  const nextLvlXP = xpToNext(xpProfile.level);
  const prevLvlXP = xpProfile.level > 1 ? xpToNext(xpProfile.level - 1) : 0;
  const progress = Math.min(100, ((xpProfile.xp - prevLvlXP) / (nextLvlXP - prevLvlXP)) * 100);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-8">
        <h1 className="text-2xl font-black text-white italic tracking-tighter">FLOWFI</h1>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col px-4 py-3 rounded-xl transition-all
                ${isActive || location.pathname === item.path
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {item.name === 'Freedom Ladder' && (
                  <div className="mt-1 ml-8 text-[9px] font-bold text-slate-500 italic truncate group-hover:text-slate-400">
                      {(() => {
                          const completed = JSON.parse(localStorage.getItem('completedMonths') || '[]').length;
                          return `Month ${completed + 1}: Pay to credit...`;
                      })()}
                  </div>
              )}
            </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <Link to="/game" className="block p-3 bg-slate-950 rounded-lg border border-slate-800 group hover:border-primary-500/30 transition-all">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Lvl {xpProfile.level}</span>
            <span className="text-[10px] font-bold text-primary-400">{xpProfile.xp} XP</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
