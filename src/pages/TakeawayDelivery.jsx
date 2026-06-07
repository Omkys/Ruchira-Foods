import { useEffect, useState } from 'react'
import { Printer, Download, Save } from 'lucide-react'
import CustomerCard from '../components/CustomerCard'
import MenuPicker from '../components/MenuPicker'
import OrderCart, { getCartItems } from '../components/OrderCart'
import ReceiptPreview from '../components/ReceiptPreview'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../context/ToastContext'
import { useCart } from '../hooks/useCart'
import { fetchMenuItems } from '../services/menuService'
import { createCustomer, getCustomerById, updateCustomer } from '../services/customerService'
import { createOrder, generateReceiptForOrder } from '../services/orderService'
import { createMonthlyPlan, renewMonthlyPlan } from '../services/monthlyPlanService'
import { downloadReceiptPDF } from '../utils/pdfGenerator'
import { ORDER_TYPES } from '../utils/constants'
import { buildPreviewOrder } from '../utils/buildPreviewOrder'
import { emptyCustomerForm } from '../components/CustomerCard'

export default function TakeawayDelivery() {
  const { addToast } = useToast()
  const { cart, addItem, updateQuantity, setQuantity, removeItem, clearCart } = useCart()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm)
  const [customerCardKey, setCustomerCardKey] = useState(0)
  const [savingCustomer, setSavingCustomer] = useState(false)
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

  const previewCustomer = selectedCustomer || (customerForm.name ? {
    name: customerForm.name,
    phone: customerForm.phone,
    address: customerForm.address,
    customer_type: customerForm.customerType,
  } : null)

  const previewOrder = cartItems.length > 0 && !completedOrder
    ? buildPreviewOrder({
        orderType: ORDER_TYPES.DELIVERY,
        customer: previewCustomer,
        cartItems,
      })
    : null

  const displayOrder = completedOrder || previewOrder
  const displayItems = displayOrder?.order_items

  const registerCustomer = async (form) => {
    if (!form.name || !form.phone) {
      addToast('Name and phone are required', 'warning')
      return null
    }
    try {
      const customer = await createCustomer({
        name: form.name,
        phone: form.phone,
        address: form.address,
        customerType: form.customerType,
      })
      if (form.customerType === 'monthly' && form.startDate && form.endDate) {
        await createMonthlyPlan({
          customerId: customer.id,
          startDate: form.startDate,
          endDate: form.endDate,
        })
      }
      setSelectedCustomer(customer)
      addToast('Customer registered', 'success')
      return customer
    } catch (err) {
      addToast(err.message, 'error')
      return null
    }
  }

  const handleSaveCustomer = async (form, { mode = 'register' } = {}) => {
    setSavingCustomer(true)
    try {
      // Renew monthly plan date only
      if (mode === 'renew' && selectedCustomer?.id && form.planId && form.renewDate) {
        await renewMonthlyPlan(form.planId, form.renewDate)
        const updated = await getCustomerById(selectedCustomer.id)
        setSelectedCustomer(updated)
        addToast('Renew date updated', 'success')
        return true
      }

      // Update existing customer profile
      if (mode === 'update' && selectedCustomer?.id) {
        await updateCustomer(selectedCustomer.id, {
          name: form.name,
          phone: form.phone,
          address: form.address || null,
          customer_type: form.customerType,
        })

        if (form.customerType === 'monthly' && form.startDate && form.endDate && !form.planId) {
          await createMonthlyPlan({
            customerId: selectedCustomer.id,
            startDate: form.startDate,
            endDate: form.endDate,
          })
        }

        const updated = await getCustomerById(selectedCustomer.id)
        setSelectedCustomer(updated)
        addToast('Customer updated', 'success')
        return true
      }

      // Register new customer
      const customer = await registerCustomer(form)
      return !!customer
    } catch (err) {
      addToast(err.message, 'error')
      return false
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleCreateOrder = async () => {
    if (cartItems.length === 0) {
      addToast('Please add at least one item', 'warning')
      return
    }

    let customer = selectedCustomer

    // Auto-register new customer if not yet saved
    if (!customer) {
      customer = await registerCustomer(customerForm)
      if (!customer) return
    }

    setSubmitting(true)
    try {
      const { order, items } = await createOrder({
        customerId: customer.id,
        orderType: ORDER_TYPES.DELIVERY,
        items: cartItems,
        status: 'delivered',
      })
      const { receipt: rec, order: fullOrder } = await generateReceiptForOrder(order.id)
      setCompletedOrder({ ...fullOrder, order_items: items })
      setReceipt(rec)
      addToast('Order created successfully', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewOrder = () => {
    clearCart()
    setSelectedCustomer(null)
    setCustomerForm(emptyCustomerForm)
    setCustomerCardKey((k) => k + 1)
    setCompletedOrder(null)
    setReceipt(null)
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
      <div className="lg:col-span-3 space-y-4">
        {/* Step 1: Select menu items */}
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold">Menu</h2>
          <p className="mb-4 text-sm text-gray-500">Step 1 — Select items for the order</p>
          <MenuPicker menuItems={menuItems} onAdd={addItem} />
        </div>

        {/* Step 2: Customer details — shown after items are added */}
        {cartItems.length > 0 && !completedOrder && (
          <>
            <CustomerCard
              key={customerCardKey}
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              onClearCustomer={() => setSelectedCustomer(null)}
              onSaveCustomer={handleSaveCustomer}
              onFormChange={setCustomerForm}
              saving={savingCustomer}
            />
            <button
              onClick={handleCreateOrder}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              <Save size={18} />
              {submitting ? 'Creating Order...' : 'Create Order & Receipt'}
            </button>
          </>
        )}

        {completedOrder && (
          <button onClick={handleNewOrder} className="w-full rounded-lg border py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
            New Order
          </button>
        )}
      </div>

      <div className="lg:col-span-2">
        <div className="space-y-4 lg:sticky lg:top-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Order Cart</h2>
            <OrderCart menuItems={menuItems} cart={cart} onUpdateQuantity={updateQuantity} onSetQuantity={setQuantity} onRemove={removeItem} />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Receipt Preview</h2>
            {displayOrder ? (
              <ReceiptPreview order={displayOrder} receipt={receipt} items={displayItems} />
            ) : (
              <p className="py-12 text-center text-sm text-gray-400">Add items to see receipt preview</p>
            )}
          </div>
          {completedOrder && (
            <div className="no-print flex gap-3">
              <button onClick={() => window.print()} className="flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium hover:bg-gray-50">
                <Printer size={18} /> Print
              </button>
              <button
                onClick={() => { downloadReceiptPDF(completedOrder, receipt, completedOrder.order_items); addToast('PDF downloaded', 'success') }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white"
              >
                <Download size={18} /> PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
