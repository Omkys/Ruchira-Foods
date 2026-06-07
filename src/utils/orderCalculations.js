export function calculateOrderTotals(items) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return { subtotal: totalAmount, gstAmount: 0, totalAmount }
}
