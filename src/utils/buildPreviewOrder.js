import { calculateOrderTotals } from './orderCalculations'

/** Build a preview order object from cart state for live receipt preview */
export function buildPreviewOrder({ orderType, tableNumber, customer, cartItems }) {
  const items = cartItems.map((item) => ({
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    item_total: item.price * item.quantity,
  }))

  const { totalAmount } = calculateOrderTotals(cartItems)

  return {
    order_type: orderType,
    table_number: tableNumber ? parseInt(tableNumber, 10) : null,
    customers: customer || null,
    total_amount: totalAmount,
    subtotal: totalAmount,
    gst_amount: 0,
    created_at: new Date().toISOString(),
    order_items: items,
  }
}
