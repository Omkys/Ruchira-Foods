import { useEffect, useState, useMemo } from 'react'
import { Printer, Download, Save, Minus, Plus, ShoppingCart } from 'lucide-react'
import ReceiptPreview from '../components/ReceiptPreview'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../context/ToastContext'
import { fetchMenuItems } from '../services/menuService'
import { createReceipt } from '../services/receiptService'
import { downloadReceiptPDF } from '../utils/pdfGenerator'
import { formatCurrency } from '../utils/formatters'

export default function ReceiptGenerator() {
  const { addToast } = useToast()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [generatedReceipt, setGeneratedReceipt] = useState(null)
  const [generatedItems, setGeneratedItems] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    try {
      const data = await fetchMenuItems()
      setMenuItems(data.filter((item) => item.available))
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      const current = prev[itemId] || 0
      const newQty = Math.max(0, current + delta)
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [itemId]: newQty }
    })
  }

  const setQuantity = (itemId, value) => {
    const qty = parseInt(value, 10) || 0
    if (qty <= 0) {
      setCart((prev) => {
        const { [itemId]: _, ...rest } = prev
        return rest
      })
    } else {
      setCart((prev) => ({ ...prev, [itemId]: qty }))
    }
  }

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const menuItem = menuItems.find((m) => m.id === id)
        if (!menuItem) return null
        return {
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price),
          quantity,
        }
      })
      .filter(Boolean)
  }, [cart, menuItems])

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const previewReceipt = cartItems.length > 0
    ? {
        receipt_number: 'PREVIEW',
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        total_amount: grandTotal,
        created_at: new Date().toISOString(),
      }
    : null

  const previewItems = cartItems.map((item) => ({
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    item_total: item.price * item.quantity,
  }))

  const handleGenerate = async () => {
    if (cartItems.length === 0) {
      addToast('Please add at least one item', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const { receipt, items } = await createReceipt({
        customerName,
        customerPhone,
        customerAddress,
        items: cartItems,
      })
      setGeneratedReceipt(receipt)
      setGeneratedItems(items)
      addToast(`Receipt ${receipt.receipt_number} generated!`, 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    const receipt = generatedReceipt || previewReceipt
    const items = generatedReceipt ? generatedItems : previewItems
    if (!receipt) return
    downloadReceiptPDF(receipt, items)
    addToast('PDF downloaded', 'success')
  }

  const handleReset = () => {
    setCart({})
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setGeneratedReceipt(null)
    setGeneratedItems([])
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const displayReceipt = generatedReceipt || previewReceipt
  const displayItems = generatedReceipt ? generatedItems : previewItems

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Menu Selection */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Select Items
            </h2>

            {menuItems.length === 0 ? (
              <p className="text-sm text-gray-500">
                No available menu items. Add items in Menu Management first.
              </p>
            ) : (
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/30"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.category} &middot; {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={cart[item.id] || 0}
                        onChange={(e) => setQuantity(item.id, e.target.value)}
                        className="w-12 rounded-lg border border-gray-200 text-center text-sm focus:border-primary-500 focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-gray-900">
              Customer Details (Optional)
            </h2>
            <p className="mb-4 text-sm text-gray-500">
              Add delivery details for the delivery person
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone Number"
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <textarea
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Delivery Address (house no., street, area, landmark)"
                rows={3}
                className="sm:col-span-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          {/* Totals */}
          {cartItems.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  <Save size={18} />
                  {submitting ? 'Generating...' : 'Generate Receipt'}
                </button>
                {generatedReceipt && (
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    New Receipt
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Receipt Preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Receipt Preview
                </h2>
                {cartItems.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <ShoppingCart size={14} />
                    {cartItems.reduce((s, i) => s + i.quantity, 0)} items
                  </span>
                )}
              </div>

              {displayReceipt ? (
                <ReceiptPreview
                  receipt={displayReceipt}
                  items={displayItems}
                />
              ) : (
                <div className="py-12 text-center text-sm text-gray-400">
                  Add items to see receipt preview
                </div>
              )}
            </div>

            {displayReceipt && (
              <div className="no-print flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
