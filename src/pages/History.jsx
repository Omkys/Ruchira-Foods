import { useEffect, useState } from 'react'
import { Search, Calendar, Eye, Printer, Download, Trash2 } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ActionMenu from '../components/ActionMenu'
import ReceiptPreview from '../components/ReceiptPreview'
import OrderStatusBadge from '../components/OrderStatusBadge'
import { useToast } from '../context/ToastContext'
import { fetchOrders, getOrderById, deleteOrder } from '../services/orderService'
import { downloadReceiptPDF } from '../utils/pdfGenerator'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function History() {
  const { addToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [search, dateFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await fetchOrders({
        search: search || undefined,
        dateFilter: dateFilter || undefined,
      })
      setOrders(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const viewOrder = async (order) => {
    setDetailLoading(true)
    try {
      const full = await getOrderById(order.id)
      setSelectedOrder(full)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (order) => {
    setDeleting(true)
    try {
      await deleteOrder(order.id)
      if (selectedOrder?.id === order.id) setSelectedOrder(null)
      setDeleteConfirm(null)
      addToast('Order deleted', 'success')
      loadOrders()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const receipt = selectedOrder?.receipts?.[0]

  const columns = [
    {
      key: 'receipt_number',
      label: 'Receipt #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-primary-600">
          {row.receipts?.[0]?.receipt_number || '—'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className="capitalize text-xs">{row.order_type?.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) =>
        row.customers?.name || (row.table_number ? `Table ${row.table_number}` : 'Walk-in'),
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <ActionMenu
          items={[
            { label: 'View', icon: <Eye size={14} />, onClick: () => viewOrder(row) },
            { label: 'Delete', icon: <Trash2 size={14} />, danger: true, onClick: () => setDeleteConfirm(row) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt number, customer name or phone..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div className="relative">
          <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        {(search || dateFilter) && (
          <button
            onClick={() => { setSearch(''); setDateFilter('') }}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        emptyMessage="No orders found"
        onRowClick={viewOrder}
      />

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Order" size="sm">
        <p className="text-sm text-gray-600">
          Delete this order
          {deleteConfirm?.receipts?.[0]?.receipt_number && (
            <> (<strong>{deleteConfirm.receipts[0].receipt_number}</strong>)</>
          )}
          ? This cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="rounded-lg border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm)}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={receipt ? `Receipt ${receipt.receipt_number}` : 'Order Details'}
        size="lg"
      >
        {detailLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : selectedOrder && (
          <div className="space-y-4">
            <ReceiptPreview
              order={selectedOrder}
              receipt={receipt}
              items={selectedOrder.order_items}
            />
            {receipt && (
              <div className="no-print flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  <Printer size={16} /> Print
                </button>
                <button
                  onClick={() => {
                    downloadReceiptPDF(selectedOrder, receipt, selectedOrder.order_items)
                    addToast('PDF downloaded', 'success')
                  }}
                  className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                >
                  <Download size={16} /> Download PDF
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
