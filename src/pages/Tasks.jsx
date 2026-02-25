import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Plus, Search, Pencil, Trash2, X, CheckSquare, Calendar, User, DollarSign } from 'lucide-react'

const STATUS_LABELS = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
}

function TaskModal({ task, contacts, deals, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending',
    due_date: task?.due_date || '',
    contact_id: task?.contact_id || '',
    deal_id: task?.deal_id || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{task ? '编辑任务' : '新增任务'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务标题 *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              className="input min-h-[100px] resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                className="select"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
              <input
                type="date"
                className="input"
                value={formData.due_date}
                onChange={e => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联联系人</label>
            <select
              className="select"
              value={formData.contact_id}
              onChange={e => setFormData({...formData, contact_id: e.target.value})}
            >
              <option value="">选择联系人</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">关联商机</label>
            <select
              className="select"
              value={formData.deal_id}
              onChange={e => setFormData({...formData, deal_id: e.target.value})}
            >
              <option value="">选择商机</option>
              {deals.map(deal => (
                <option key={deal.id} value={deal.id}>{deal.title}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              取消
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [contacts, setContacts] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [tasksRes, contactsRes, dealsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('contacts').select('id, first_name, last_name').order('first_name'),
        supabase.from('deals').select('id, title').order('title')
      ])
      
      setTasks(tasksRes.data || [])
      setContacts(contactsRes.data || [])
      setDeals(dealsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(formData) {
    try {
      const data = { 
        ...formData, 
        contact_id: formData.contact_id || null,
        deal_id: formData.deal_id || null
      }
      
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingTask.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([data])
        
        if (error) throw error
      }
      
      fetchData()
      setShowModal(false)
      setEditingTask(null)
    } catch (error) {
      console.error('Error saving task:', error)
      alert('保存失败: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除这个任务吗？')) return
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('删除失败: ' + error.message)
    }
  }

  async function toggleStatus(task) {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId)
    return contact ? `${contact.first_name} ${contact.last_name}` : '-'
  }

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.id === dealId)
    return deal?.title || '-'
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || t.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const pendingCount = tasks.filter(t => t.status === 'pending').length
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">任务管理</h1>
          <p className="text-gray-500 mt-1">跟踪和管理您的任务</p>
        </div>
        <button 
          onClick={() => { setEditingTask(null); setShowModal(true) }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          新增任务
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-gray-500">待处理任务</div>
          <div className="text-xl font-bold text-yellow-600">{pendingCount}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">已完成任务</div>
          <div className="text-xl font-bold text-green-600">{completedCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            className="input pl-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="select w-48"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">所有状态</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无任务数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header w-10"></th>
                <th className="table-header">任务标题</th>
                <th className="table-header">状态</th>
                <th className="table-header">截止日期</th>
                <th className="table-header">关联联系人</th>
                <th className="table-header">关联商机</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <button
                      onClick={() => toggleStatus(task)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className={`table-cell font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </td>
                  <td className="table-cell">
                    <span className={`badge badge-${task.status}`}>
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td className="table-cell">
                    {task.due_date ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {task.due_date}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="table-cell">{getContactName(task.contact_id)}</td>
                  <td className="table-cell">{getDealTitle(task.deal_id)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingTask(task); setShowModal(true) }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(task.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          contacts={contacts}
          deals={deals}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
