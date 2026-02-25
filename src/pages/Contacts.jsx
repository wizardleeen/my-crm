import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Plus, Search, Pencil, Trash2, X, User, Mail, Phone, Building2 } from 'lucide-react'

function ContactModal({ contact, companies, onClose, onSave }) {
  const [formData, setFormData] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company_id: contact?.company_id || '',
    status: contact?.status || 'lead'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{contact ? '编辑联系人' : '新增联系人'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名 *</label>
              <input
                type="text"
                className="input"
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">姓</label>
              <input
                type="text"
                className="input"
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              className="select"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="lead">线索</option>
              <option value="prospect">潜在客户</option>
              <option value="customer">客户</option>
              <option value="inactive">非活跃</option>
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

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        supabase.from('contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('id, name').order('name')
      ])
      
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
      const data = { ...formData }
      if (!data.company_id) data.company_id = null
      
      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', editingContact.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([data])
        
        if (error) throw error
      }
      
      fetchData()
      setShowModal(false)
      setEditingContact(null)
    } catch (error) {
      console.error('Error saving contact:', error)
      alert('保存失败: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除这个联系人吗？')) return
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('删除失败: ' + error.message)
    }
  }

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId)
    return company?.name || '-'
  }

  const getStatusLabel = (status) => {
    const labels = { lead: '线索', prospect: '潜在客户', customer: '客户', inactive: '非活跃' }
    return labels[status] || status
  }

  const filteredContacts = contacts.filter(c => 
    c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">联系人管理</h1>
          <p className="text-gray-500 mt-1">管理您的客户联系人</p>
        </div>
        <button 
          onClick={() => { setEditingContact(null); setShowModal(true) }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          新增联系人
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索联系人..."
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
        ) : filteredContacts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无联系人数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">姓名</th>
                <th className="table-header">邮箱</th>
                <th className="table-header">电话</th>
                <th className="table-header">公司</th>
                <th className="table-header">状态</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">
                    {contact.first_name} {contact.last_name}
                  </td>
                  <td className="table-cell">
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                        {contact.email}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="table-cell">{contact.phone || '-'}</td>
                  <td className="table-cell">{getCompanyName(contact.company_id)}</td>
                  <td className="table-cell">
                    <span className={`badge badge-${contact.status}`}>
                      {getStatusLabel(contact.status)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingContact(contact); setShowModal(true) }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
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
        <ContactModal
          contact={editingContact}
          companies={companies}
          onClose={() => { setShowModal(false); setEditingContact(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
