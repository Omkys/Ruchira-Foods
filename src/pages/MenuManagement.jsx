import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import MenuItemForm from '../components/MenuItemForm'
import { useToast } from '../context/ToastContext'
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../services/menuService'
import { formatCurrency } from '../utils/formatters'

export default function MenuManagement() {
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await fetchMenuItems()
      setItems(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData)
        addToast('Menu item updated', 'success')
      } else {
        await createMenuItem(formData)
        addToast('Menu item added', 'success')
      }
      setModalOpen(false)
      setEditingItem(null)
      loadItems()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id)
      addToast('Menu item deleted', 'success')
      setDeleteConfirm(null)
      loadItems()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {row.category}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.price)}</span>
      ),
    },
    {
      key: 'available',
      label: 'Status',
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.available
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {row.available ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              openEdit(row)
            }}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteConfirm(row)
            }}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          <Plus size={18} />
          Add Food Item
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        emptyMessage="No menu items found. Add your first item!"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingItem(null)
        }}
        title={editingItem ? 'Edit Food Item' : 'Add Food Item'}
      >
        <MenuItemForm
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false)
            setEditingItem(null)
          }}
          loading={submitting}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Menu Item"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirm.id)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  )
}
