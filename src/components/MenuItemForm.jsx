import { useState } from 'react'
import { CATEGORIES } from '../utils/constants'

const defaultForm = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  available: true,
}

export default function MenuItemForm({ initialData, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(initialData || defaultForm)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      price: parseFloat(form.price),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Food Name
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="e.g. Butter Chicken"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Price (₹)
        </label>
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="0.00"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="available"
          id="available"
          checked={form.available}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor="available" className="text-sm text-gray-700">
          Available for ordering
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
        </button>
      </div>
    </form>
  )
}
