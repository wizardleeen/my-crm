import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Building2, Users, DollarSign, CheckSquare, LayoutDashboard, Activity } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import Contacts from './pages/Contacts'
import Deals from './pages/Deals'
import Tasks from './pages/Tasks'

function App() {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '仪表盘' },
    { path: '/companies', icon: Building2, label: '公司' },
    { path: '/contacts', icon: Users, label: '联系人' },
    { path: '/deals', icon: DollarSign, label: '商机' },
    { path: '/tasks', icon: CheckSquare, label: '任务' },
  ]

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">CRM 系统</span>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                end={item.path === '/'}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-800">
            <div className="text-xs text-gray-500 text-center">
              Powered by Supabase
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
