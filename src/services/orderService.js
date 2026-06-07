import { supabase } from '../lib/supabase'
import { calculateOrderTotals } from '../utils/orderCalculations'
import { generateReceiptNumber } from '../utils/receiptNumber'

export async function createOrder({
  customerId,
  orderType,
  tableNumber,
  items,
  status = 'pending',
}) {
  const { totalAmount } = calculateOrderTotals(items)

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([{
      customer_id: customerId || null,
      order_type: orderType,
      status,
      table_number: tableNumber || null,
      subtotal: totalAmount,
      gst_amount: 0,
      total_amount: totalAmount,
    }])
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = items.map((item) => ({
    order_id: order.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    item_total: item.price * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  return { order, items: orderItems }
}

export async function fetchOrders({ orderType, status, search, dateFilter } = {}) {
  let query = supabase
    .from('orders')
    .select('*, customers(*), order_items(*), receipts(*)')
    .order('created_at', { ascending: false })

  if (orderType) query = query.eq('order_type', orderType)
  if (status) query = query.eq('status', status)

  if (dateFilter) {
    const start = new Date(dateFilter)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateFilter)
    end.setHours(23, 59, 59, 999)
    query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
  }

  const { data, error } = await query
  if (error) throw error

  if (search) {
    const s = search.toLowerCase()
    return data.filter((o) =>
      o.customers?.name?.toLowerCase().includes(s) ||
      o.customers?.phone?.includes(s) ||
      o.receipts?.[0]?.receipt_number?.toLowerCase().includes(s)
    )
  }

  return data
}

export async function fetchDeliveryOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*)')
    .eq('order_type', 'delivery')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getOrderById(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*), order_items(*), receipts(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateOrderStatus(orderId, status) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('*, customers(*), order_items(*)')
    .single()

  if (error) throw error
  return data
}

export async function generateReceiptForOrder(orderId) {
  const order = await getOrderById(orderId)

  if (order.receipts?.length > 0) {
    return { receipt: order.receipts[0], order }
  }

  const receiptNumber = await generateReceiptNumber()

  const { data: receipt, error } = await supabase
    .from('receipts')
    .insert([{ receipt_number: receiptNumber, order_id: orderId }])
    .select()
    .single()

  if (error) throw error
  return { receipt, order }
}

export async function deleteOrder(id) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw error
}

export async function getPendingDeliveriesCount() {
  const { count, error } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('order_type', 'delivery')
    .in('status', ['pending', 'preparing', 'ready', 'out_for_delivery'])

  if (error) throw error
  return count || 0
}
