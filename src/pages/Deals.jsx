import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Plus, Search, Pencil, Trash2, X, DollarSign, Calendar, User, Building2 } from 'lucide-react'

const STAGE_LABELS = {
  new: '新线索',
  qualified: '已验证',
  proposal: '报价中',
  negotiation: '谈判中',
  won: '已成交',
  lost: '已丢失'
}

function DealModal({ deal, contacts, companies, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: deal?.title || '',
    value: deal?.value || '',
    stage: deal?.stage || 'new',
    contact_id: deal?.contact_id || '',
    company_id: deal?.company_id || '',
    expected_close_date: deal?.expected_close_date || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{deal ? '编辑商机' : '新增商机'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">商机名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">金额 (¥)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">阶段</label>
              <select
                className="select"
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
              >
                {Object.entries(STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">公司</label>
            <select
              className="select"
              value={formData.company_id}
              onChange={e => setFormData({...formData, company_id: e.target.value})}
            >
              <option value="">选择公司</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">预计成交日期</label>
            <input
              type="date"
              className="input"
              value={formData.expected_close_date}
              onChange={e => setFormData({...formData, expected_close_date: e.target.value})}
            />
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

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDeal, setEditingDeal] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [dealsRes, contactsRes, companiesRes] = await Promise.all([
        supabase.from('deals').select('*').order('created_at', { ascending: false }),
        supabase.from('contacts').select('id, first_name, last_name').order('first_name'),
        supabase.from('companies').select('id, name').order('name')
      ])
      
      setDeals(dealsRes.data || [])
      setContacts(contactsRes.data || [])
      setCompanies(companiesRes.data || [])
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
        value: parseFloat(formData.value) || 0,
        contact_id: formData.contact_id || null,
        company_id: formData.company_id || null
      }
      
      if (editingDeal) {
        const { error } = await supabase
          .from('deals')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingDeal.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('deals')
          .insert([data])
        
        if (error) throw error
      }
      
      fetchData()
      setShowModal(false)
      setEditingDeal(null)
    } catch (error) {
      console.error('Error saving deal:', error)
      alert('保存失败: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除这个商机吗？')) return
    
    try {
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert('删除失败: ' + error.message)
    }
  }

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.id === contactId)
    return contact ? `${contact.first_name} ${contact.last_name}` : '-'
  }

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId)
    return company?.name || '-'
  }

  const filteredDeals = deals.filter(d => 
    d.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = deals.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商机管理</h1>
          <p className="text-gray-500 mt-1">跟踪您的销售管道</p>
        </div>
        <button 
          onClick={() => { setEditingDeal(null); setShowModal(true) }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          新增商机
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-gray-500">商机总价值</div>
          <div className="text-xl font-bold text-gray-900">¥{totalValue.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">已成交价值</div>
          <div className="text-xl font-bold text-green-600">¥{wonValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索商机..."
            className="input pl-12"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无商机数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">商机名称</th>
                <th className="table-header">金额</th>
                <th className="table-header">阶段</th>
                <th className="table-header">联系人</th>
                <th className="table-header">公司</th>
                <th className="table-header">预计成交日</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDeals.map(deal => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{deal.title}</td>
                  <td className="table-cell">¥{parseFloat(deal.value || 0).toLocaleString()}</td>
                  <td className="table-cell">
                    <span className={`badge badge-${deal.stage}`}>
                      {STAGE_LABELS[deal.stage]}
                    </span>
                  </td>
                  <td className="table-cell">{getContactName(deal.contact_id)}</td>
                  <td className="table-cell">{getCompanyName(deal.company_id)}</td>
                  <td className="table-cell">
                    {deal.expected_close_date ? deal.expected_close_date : '-'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingDeal(deal); setShowModal(true) }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(deal.id)}
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
        <DealModal
          deal={editingDeal}
          contacts={contacts}
          companies={companies}
          onClose={() => { setShowModal(false); setEditingDeal(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
