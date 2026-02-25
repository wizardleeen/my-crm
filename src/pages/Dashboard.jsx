import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Building2, Users, DollarSign, TrendingUp, Calendar, ArrowUp, ArrowDown } from 'lucide-react'

function StatCard({ title, value, icon: Icon, trend, trendValue }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    contacts: 0,
    deals: 0,
    dealsValue: 0,
    tasks: 0,
    completedTasks: 0
  })
  const [recentDeals, setRecentDeals] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [companiesRes, contactsRes, dealsRes, tasksRes] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact' }),
        supabase.from('contacts').select('id', { count: 'exact' }),
        supabase.from('deals').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('tasks').select('*').order('due_date', { ascending: true }).limit(5)
      ])

      const dealsData = dealsRes.data || []
      const tasksData = tasksRes.data || []
      
      const wonDeals = dealsData.filter(d => d.stage === 'won')
      const totalValue = wonDeals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)

      setStats({
        companies: companiesRes.count || 0,
        contacts: contactsRes.count || 0,
        deals: dealsRes.data?.length || 0,
        dealsValue: totalValue,
        tasks: tasksData.length,
        completedTasks: tasksData.filter(t => t.status === 'completed').length
      })

      setRecentDeals(dealsData.slice(0, 5))
      setUpcomingTasks(tasksData.filter(t => t.status !== 'completed').slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来！以下是您的业务概览。</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="公司总数" 
          value={stats.companies} 
          icon={Building2}
        />
        <StatCard 
          title="联系人总数" 
          value={stats.contacts} 
          icon={Users}
        />
        <StatCard 
          title="商机总数" 
          value={stats.deals} 
          icon={DollarSign}
        />
        <StatCard 
          title="成交总额" 
          value={`¥${stats.dealsValue.toLocaleString()}`} 
          icon={TrendingUp}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deals */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">最近商机</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentDeals.length === 0 ? (
              <div className="p-6 text-center text-gray-500">暂无商机数据</div>
            ) : (
              recentDeals.map((deal) => (
                <div key={deal.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    <p className="text-sm text-gray-500">¥{parseFloat(deal.value || 0).toLocaleString()}</p>
                  </div>
                  <span className={`badge badge-${deal.stage}`}>
                    {deal.stage === 'new' && '新线索'}
                    {deal.stage === 'qualified' && '已验证'}
                    {deal.stage === 'proposal' && '报价中'}
                    {deal.stage === 'negotiation' && '谈判中'}
                    {deal.stage === 'won' && '已成交'}
                    {deal.stage === 'lost' && '已丢失'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">待办任务</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingTasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500">暂无任务</div>
            ) : (
              upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      {task.due_date && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {task.due_date}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`badge badge-${task.status}`}>
                    {task.status === 'pending' && '待处理'}
                    {task.status === 'in_progress' && '进行中'}
                    {task.status === 'completed' && '已完成'}
                    {task.status === 'cancelled' && '已取消'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
