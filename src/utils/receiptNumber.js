import { supabase } from '../lib/supabase'

/**
 * Generates unique receipt number in format: REC-YYYYMMDD-XXX
 * Example: REC-20260606-001
 */
export async function generateReceiptNumber() {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const prefix = `REC-${dateStr}`

  const { data, error } = await supabase
    .from('receipts')
    .select('receipt_number')
    .like('receipt_number', `${prefix}%`)
    .order('receipt_number', { ascending: false })
    .limit(1)

  if (error) throw error

  let sequence = 1
  if (data && data.length > 0) {
    const lastNumber = data[0].receipt_number
    const lastSequence = parseInt(lastNumber.split('-')[2], 10)
    sequence = lastSequence + 1
  }

  return `${prefix}-${String(sequence).padStart(3, '0')}`
}
