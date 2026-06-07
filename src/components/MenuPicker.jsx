import { Plus } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

export default function MenuPicker({ menuItems, onAdd }) {
  if (menuItems.length === 0) {
    return (
      <p className="text-sm text-gray-500">No menu items available. Add items in Menu Management.</p>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onAdd(item.id)}
          className="flex items-center justify-between rounded-lg border border-gray-100 p-3 text-left transition hover:border-primary-200 hover:bg-primary-50/30"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500">
              {item.category} · {formatCurrency(item.price)}
            </p>
          </div>
          <Plus size={18} className="text-primary-500" />
        </button>
      ))}
    </div>
  )
}
