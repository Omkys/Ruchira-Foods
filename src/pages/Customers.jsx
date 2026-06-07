import { useEffect, useState } from 'react'
import { Search, Eye, Pencil } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { useToast } from '../context/ToastContext'
import { fetchCustomers, updateCustomer, getCustomerOrders } from '../services/customerService'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import { CUSTOMER_TYPES } from '../utils/constants'

export default function Customers() {
  const { addToast } = useToast()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editCustomer, setEditCustomer] = useState(null)
  const [viewCustomer, setViewCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    loadCustomers()
  }, [search])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await fetchCustomers(search)
      setCustomers(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      await updateCustomer(editCustomer.id, {
        name: editCustomer.name,
        phone: editCustomer.phone,
        address: editCustomer.address,
        customer_type: editCustomer.customer_type,
      })
      addToast('Customer updated', 'success')
      setEditCustomer(null)
      loadCustomers()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const viewProfile = async (customer) => {
    setViewCustomer(customer)
    setOrdersLoading(true)
    try {
      const orders = await getCustomerOrders(customer.id)
      setCustomerOrders(orders)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setOrdersLoading(false)
    }
  }

  const activePlan = (customer) =>
    customer.monthly_plans?.find((p) => p.is_active)

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'address',
      label: 'Address',
      render: (row) => (
        <span className="max-w-[200px] truncate block">{row.address || '—'}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
          row.customer_type === 'monthly' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {row.customer_type}
        </span>
      ),
    },
    {
      key: 'plan',
      label: 'Plan Status',
      render: (row) => {
        const plan = activePlan(row)
        if (!plan) return '—'
        return (
          <span className={`text-xs font-medium ${plan.is_active ? 'text-green-600' : 'text-gray-400'}`}>
            {plan.is_active ? 'Active' : 'Inactive'}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); viewProfile(row) }} className="rounded p-1.5 text-gray-400 hover:bg-primary-50 hover:text-primary-600">
            <Eye size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setEditCustomer({ ...row }) }} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600">
            <Pencil size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>

      <DataTable columns={columns} data={customers} loading={loading} emptyMessage="No customers found" onRowClick={viewProfile} />

      {/* Edit Modal */}
      <Modal isOpen={!!editCustomer} onClose={() => setEditCustomer(null)} title="Edit Customer">
        {editCustomer && (
          <div className="space-y-4">
            <input value={editCustomer.name} onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border px-4 py-2.5 text-sm" />
            <input value={editCustomer.phone} onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })} placeholder="Phone" className="w-full rounded-lg border px-4 py-2.5 text-sm" />
            <textarea value={editCustomer.address || ''} onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })} placeholder="Address" rows={3} className="w-full rounded-lg border px-4 py-2.5 text-sm" />
            <select value={editCustomer.customer_type} onChange={(e) => setEditCustomer({ ...editCustomer, customer_type: e.target.value })} className="w-full rounded-lg border px-4 py-2.5 text-sm">
              {CUSTOMER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditCustomer(null)} className="rounded-lg border px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={handleUpdate} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={!!viewCustomer} onClose={() => { setViewCustomer(null); setCustomerOrders([]) }} title={viewCustomer?.name || 'Customer Profile'} size="lg">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4 text-sm">
              <p><strong>Phone:</strong> {viewCustomer.phone}</p>
              <p><strong>Address:</strong> {viewCustomer.address || '—'}</p>
              <p className="capitalize"><strong>Type:</strong> {viewCustomer.customer_type}</p>
              {activePlan(viewCustomer) && (
                <p><strong>Plan:</strong> {activePlan(viewCustomer).start_date} to {activePlan(viewCustomer).end_date}</p>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">Order History</h3>
            {ordersLoading ? (
              <p className="text-sm text-gray-400">Loading orders...</p>
            ) : customerOrders.length === 0 ? (
              <p className="text-sm text-gray-400">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-sm">
                    <div>
                      <p className="font-medium capitalize">{order.order_type?.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <OrderStatusBadge status={order.status} />
                      <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
