import { supabase } from '../lib/supabase'
import { generateReceiptNumber } from '../utils/receiptNumber'

export async function createReceipt({ customerName, customerPhone, customerAddress, items }) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const receiptNumber = await generateReceiptNumber()

  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .insert([{
      receipt_number: receiptNumber,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_address: customerAddress || null,
      subtotal: totalAmount,
      gst_amount: 0,
      total_amount: totalAmount,
    }])
    .select()
    .single()

  if (receiptError) throw receiptError

  const receiptItems = items.map((item) => ({
    receipt_id: receipt.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
    item_total: item.price * item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('receipt_items')
    .insert(receiptItems)

  if (itemsError) throw itemsError

  return { receipt, items: receiptItems }
}

export async function fetchReceipts({ search, dateFilter } = {}) {
  let query = supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `receipt_number.ilike.%${search}%,customer_name.ilike.%${search}%`
    )
  }

  if (dateFilter) {
    const start = new Date(dateFilter)
    start.setHours(0, 0, 0, 0)
    const end = new Date(dateFilter)
    end.setHours(23, 59, 59, 999)
    query = query
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchReceiptWithItems(receiptId) {
  const { data: receipt, error: receiptError } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', receiptId)
    .single()

  if (receiptError) throw receiptError

  const { data: items, error: itemsError } = await supabase
    .from('receipt_items')
    .select('*')
    .eq('receipt_id', receiptId)

  if (itemsError) throw itemsError

  return { receipt, items }
}

export async function deleteReceipt(id) {
  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchRecentReceipts(limit = 5) {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
