import { useEffect, useState } from 'react'
import { Plus, Pencil, RefreshCw, Ban } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import {
  fetchMonthlyPlans,
  createMonthlyPlan,
  updateMonthlyPlan,
  renewMonthlyPlan,
  deactivateMonthlyPlan,
} from '../services/monthlyPlanService'
import { createCustomer } from '../services/customerService'
import { formatDate, getTodayDateInput } from '../utils/formatters'

export default function MonthlyPlans() {
  const { addToast } = useToast()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [form, setForm] = useState({ customerId: '', customerName: '', phone: '', address: '', startDate: '', endDate: '' })

  useEffect(() => { loadPlans() }, [])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const data = await fetchMonthlyPlans()
      setPlans(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      let customerId = form.customerId
      if (!customerId && form.customerName && form.phone) {
        const customer = await createCustomer({
          name: form.customerName,
          phone: form.phone,
          address: form.address,
          customerType: 'monthly',
        })
        customerId = customer.id
      }
      if (!customerId || !form.startDate || !form.endDate) {
        addToast('Please fill all required fields', 'warning')
        return
      }
      await createMonthlyPlan({ customerId, startDate: form.startDate, endDate: form.endDate })
      addToast('Monthly plan created', 'success')
      setModalOpen(false)
      setForm({ customerId: '', customerName: '', phone: '', address: '', startDate: '', endDate: '' })
      loadPlans()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleRenew = async (plan) => {
    const newEnd = prompt('Enter new end date (YYYY-MM-DD):', plan.end_date)
    if (!newEnd) return
    try {
      await renewMonthlyPlan(plan.id, newEnd)
      addToast('Plan renewed', 'success')
      loadPlans()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleDeactivate = async (plan) => {
    if (!confirm(`Deactivate plan for ${plan.customers?.name}?`)) return
    try {
      await deactivateMonthlyPlan(plan.id)
      addToast('Plan deactivated', 'success')
      loadPlans()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const handleEdit = async () => {
    try {
      await updateMonthlyPlan(editPlan.id, {
        start_date: editPlan.start_date,
        end_date: editPlan.end_date,
        is_active: editPlan.is_active,
      })
      addToast('Plan updated', 'success')
      setEditPlan(null)
      loadPlans()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (row) => row.customers?.name || '—',
    },
    { key: 'phone', label: 'Phone', render: (row) => row.customers?.phone || '—' },
    {
      key: 'address',
      label: 'Address',
      render: (row) => (
        <span className="max-w-[180px] truncate block">{row.customers?.address || '—'}</span>
      ),
    },
    { key: 'start', label: 'Start', render: (row) => formatDate(row.start_date) },
    { key: 'end', label: 'End', render: (row) => formatDate(row.end_date) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          row.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); setEditPlan({ ...row }) }} className="rounded p-1.5 text-gray-400 hover:text-blue-600" title="Edit">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleRenew(row) }} className="rounded p-1.5 text-gray-400 hover:text-green-600" title="Renew">
            <RefreshCw size={14} />
          </button>
          {row.is_active && (
            <button onClick={(e) => { e.stopPropagation(); handleDeactivate(row) }} className="rounded p-1.5 text-gray-400 hover:text-red-600" title="Deactivate">
              <Ban size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
          <Plus size={18} /> Create Plan
        </button>
      </div>

      <DataTable columns={columns} data={plans} loading={loading} emptyMessage="No monthly plans yet" />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Monthly Plan">
        <div className="space-y-4">
          <input placeholder="Customer Name *" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full rounded-lg border px-4 py-2.5 text-sm" />
          <input placeholder="Phone *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border px-4 py-2.5 text-sm" />
          <textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="w-full rounded-lg border px-4 py-2.5 text-sm" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Start Date *</label>
              <input type="date" min={getTodayDateInput()} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">End Date *</label>
              <input type="date" min={form.startDate || getTodayDateInput()} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button onClick={handleCreate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">Create</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editPlan} onClose={() => setEditPlan(null)} title="Edit Plan">
        {editPlan && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Customer: <strong>{editPlan.customers?.name}</strong></p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Start Date</label>
                <input type="date" min={getTodayDateInput()} value={editPlan.start_date} onChange={(e) => setEditPlan({ ...editPlan, start_date: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-500">End Date</label>
                <input type="date" min={editPlan.start_date || getTodayDateInput()} value={editPlan.end_date} onChange={(e) => setEditPlan({ ...editPlan, end_date: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editPlan.is_active} onChange={(e) => setEditPlan({ ...editPlan, is_active: e.target.checked })} />
              Active
            </label>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditPlan(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleEdit} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">Save</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
