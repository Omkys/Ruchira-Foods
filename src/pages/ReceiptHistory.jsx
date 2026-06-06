import { useEffect, useState } from 'react'
import { Search, Calendar, Eye, Printer, Download, Trash2 } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import ActionMenu from '../components/ActionMenu'
import ReceiptPreview from '../components/ReceiptPreview'
import { useToast } from '../context/ToastContext'
import { fetchReceipts, fetchReceiptWithItems, deleteReceipt } from '../services/receiptService'
import { downloadReceiptPDF } from '../utils/pdfGenerator'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function ReceiptHistory() {
  const { addToast } = useToast()
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedItems, setSelectedItems] = useState([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadReceipts()
  }, [search, dateFilter])

  const loadReceipts = async () => {
    try {
      setLoading(true)
      const data = await fetchReceipts({
        search: search || undefined,
        dateFilter: dateFilter || undefined,
      })
      setReceipts(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const viewReceipt = async (receipt) => {
    setDetailLoading(true)
    try {
      const { receipt: full, items } = await fetchReceiptWithItems(receipt.id)
      setSelectedReceipt(full)
      setSelectedItems(items)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDetailLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (selectedReceipt) {
      downloadReceiptPDF(selectedReceipt, selectedItems)
      addToast('PDF downloaded', 'success')
    }
  }

  const handleDelete = async (receipt) => {
    setDeleting(true)
    try {
      await deleteReceipt(receipt.id)
      if (selectedReceipt?.id === receipt.id) {
        setSelectedReceipt(null)
        setSelectedItems([])
      }
      setDeleteConfirm(null)
      addToast(`Receipt ${receipt.receipt_number} deleted`, 'success')
      loadReceipts()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'receipt_number',
      label: 'Receipt #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-primary-600">
          {row.receipt_number}
        </span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (row) => row.customer_name || 'Walk-in',
    },
    {
      key: 'customer_phone',
      label: 'Phone',
      render: (row) => row.customer_phone || '—',
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date & Time',
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <ActionMenu
          items={[
            {
              label: 'View',
              icon: <Eye size={14} />,
              onClick: () => viewReceipt(row),
            },
            {
              label: 'Delete',
              icon: <Trash2 size={14} />,
              danger: true,
              onClick: () => setDeleteConfirm(row),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt number or customer name..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <div className="relative">
          <Calendar
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        {(search || dateFilter) && (
          <button
            onClick={() => {
              setSearch('')
              setDateFilter('')
            }}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        loading={loading}
        emptyMessage="No receipts found"
        onRowClick={viewReceipt}
      />

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Receipt"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete receipt{' '}
          <strong>{deleteConfirm?.receipt_number}</strong>? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
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
        isOpen={!!selectedReceipt}
        onClose={() => {
          setSelectedReceipt(null)
          setSelectedItems([])
        }}
        title={`Receipt ${selectedReceipt?.receipt_number || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            <ReceiptPreview
              receipt={selectedReceipt}
              items={selectedItems}
            />
            <div className="no-print flex justify-end gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
