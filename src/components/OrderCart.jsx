import { Minus, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { calculateOrderTotals } from '../utils/orderCalculations'

export default function OrderCart({
  menuItems,
  cart,
  onUpdateQuantity,
  onSetQuantity,
  onRemove,
}) {
  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => {
      const item = menuItems.find((m) => m.id === id)
      if (!item) return null
      return { ...item, price: Number(item.price), quantity }
    })
    .filter(Boolean)

  const { totalAmount } = calculateOrderTotals(
    cartItems.map((i) => ({ price: i.price, quantity: i.quantity }))
  )

  if (cartItems.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No items added yet</p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
          >
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50"
              >
                <Minus size={12} />
              </button>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onSetQuantity(item.id, e.target.value)}
                className="w-10 rounded border border-gray-200 text-center text-sm"
              />
              <button
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="rounded border border-gray-200 p-1 text-gray-500 hover:bg-gray-50"
              >
                <Plus size={12} />
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="ml-1 rounded p-1 text-red-400 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold">
        <span>Total</span>
        <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
}

export function getCartItems(menuItems, cart) {
  return Object.entries(cart)
    .map(([id, quantity]) => {
      const item = menuItems.find((m) => m.id === id)
      if (!item) return null
      return { id: item.id, name: item.name, price: Number(item.price), quantity }
    })
    .filter(Boolean)
}
