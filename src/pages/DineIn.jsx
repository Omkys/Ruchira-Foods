import { useEffect, useState } from 'react'
import { Printer, Download, Save } from 'lucide-react'
import MenuPicker from '../components/MenuPicker'
import OrderCart, { getCartItems } from '../components/OrderCart'
import ReceiptPreview from '../components/ReceiptPreview'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../context/ToastContext'
import { useCart } from '../hooks/useCart'
import { fetchMenuItems } from '../services/menuService'
import { createOrder, generateReceiptForOrder } from '../services/orderService'
import { downloadReceiptPDF } from '../utils/pdfGenerator'
import { TABLE_NUMBERS } from '../utils/constants'
import { buildPreviewOrder } from '../utils/buildPreviewOrder'

export default function DineIn() {
  const { addToast } = useToast()
  const { cart, addItem, updateQuantity, setQuantity, removeItem, clearCart } = useCart()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState(null)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    fetchMenuItems()
      .then((data) => setMenuItems(data.filter((i) => i.available)))
      .catch((err) => addToast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  const cartItems = getCartItems(menuItems, cart)

  const previewOrder = cartItems.length > 0 && !completedOrder
    ? buildPreviewOrder({ orderType: 'dine_in', tableNumber, cartItems })
    : null

  const displayOrder = completedOrder || previewOrder
  const displayItems = displayOrder?.order_items

  const handleCreateOrder = async () => {
    if (!tableNumber) {
      addToast('Please select a table number', 'warning')
      return
    }
    if (cartItems.length === 0) {
      addToast('Please add at least one item', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const { order, items } = await createOrder({
        orderType: 'dine_in',
        tableNumber: parseInt(tableNumber, 10),
        items: cartItems,
        status: 'delivered',
      })
      const { receipt: rec } = await generateReceiptForOrder(order.id)
      setCompletedOrder({ ...order, order_items: items })
      setReceipt(rec)
      addToast(`Order created for Table ${tableNumber}`, 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => window.print()

  const handleDownload = () => {
    if (completedOrder && receipt) {
      downloadReceiptPDF(completedOrder, receipt, completedOrder.order_items)
      addToast('PDF downloaded', 'success')
    }
  }

  const handleNewOrder = () => {
    clearCart()
    setTableNumber('')
    setCompletedOrder(null)
    setReceipt(null)
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">Menu</h2>
          <p className="mb-4 text-sm text-gray-500">Step 1 — Select items for the order</p>
          <MenuPicker menuItems={menuItems} onAdd={addItem} />
        </div>

        {cartItems.length > 0 && !completedOrder && (
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold">Select Table</h2>
            <p className="mb-4 text-sm text-gray-500">Step 2 — Choose table number</p>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
              {TABLE_NUMBERS.map((num) => (
                <button
                  key={num}
                  onClick={() => setTableNumber(String(num))}
                  className={`rounded-lg border py-3 text-sm font-semibold transition ${
                    tableNumber === String(num)
                      ? 'border-primary-500 bg-primary-600 text-white'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? 'Processing...' : 'Generate Bill & Receipt'}
            </button>
          </div>
        )}

        {completedOrder && (
          <button onClick={handleNewOrder} className="w-full rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
            New Order
          </button>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Cart</h2>
            <OrderCart
              menuItems={menuItems}
              cart={cart}
              onUpdateQuantity={updateQuantity}
              onSetQuantity={setQuantity}
              onRemove={removeItem}
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Receipt Preview</h2>
            {displayOrder ? (
              <ReceiptPreview
                order={displayOrder}
                receipt={receipt}
                items={displayItems}
              />
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">
                Add items to see receipt preview
              </p>
            )}
          </div>
          {completedOrder && (
            <div className="no-print flex gap-3">
              <button onClick={handlePrint} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium hover:bg-gray-50">
                <Printer size={18} /> Print
              </button>
              <button onClick={handleDownload} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                <Download size={18} /> PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
