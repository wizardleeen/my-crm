import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Plus, Search, Pencil, Trash2, X, Building2 } from 'lucide-react'

function CompanyModal({ company, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    website: company?.website || '',
    industry: company?.industry || '',
    address: company?.address || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{company ? '编辑公司' : '新增公司'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司名称 *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">行业</label>
            <input
              type="text"
              className="input"
              value={formData.industry}
              onChange={e => setFormData({...formData, industry: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">网站</label>
            <input
              type="url"
              className="input"
              value={formData.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              placeholder="https://"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input
              type="text"
              className="input"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
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

export default function Companies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  async function fetchCompanies() {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(formData) {
    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingCompany.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([formData])
        
        if (error) throw error
      }
      
      fetchCompanies()
      setShowModal(false)
      setEditingCompany(null)
    } catch (error) {
      console.error('Error saving company:', error)
      alert('保存失败: ' + error.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('确定要删除这家公司吗？')) return
    
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
      alert('删除失败: ' + error.message)
    }
  }

  const filteredCompanies = companies.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">公司管理</h1>
          <p className="text-gray-500 mt-1">管理您的客户公司信息</p>
        </div>
        <button 
          onClick={() => { setEditingCompany(null); setShowModal(true) }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          新增公司
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索公司..."
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
        ) : filteredCompanies.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暂无公司数据</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">公司名称</th>
                <th className="table-header">行业</th>
                <th className="table-header">网站</th>
                <th className="table-header">地址</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.map(company => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium">{company.name}</td>
                  <td className="table-cell">{company.industry || '-'}</td>
                  <td className="table-cell">
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    ) : '-'}
                  </td>
                  <td className="table-cell">{company.address || '-'}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { setEditingCompany(company); setShowModal(true) }}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(company.id)}
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
        <CompanyModal
          company={editingCompany}
          onClose={() => { setShowModal(false); setEditingCompany(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
