import { supabase } from '../lib/supabase'

/** Generates receipt numbers: REC-2026-0001 */
export async function generateReceiptNumber() {
  const year = new Date().getFullYear()
  const prefix = `REC-${year}`

  const { data, error } = await supabase
    .from('receipts')
    .select('receipt_number')
    .like('receipt_number', `${prefix}-%`)
    .order('receipt_number', { ascending: false })
    .limit(1)

  if (error) throw error

  let sequence = 1
  if (data?.length > 0) {
    const lastSeq = parseInt(data[0].receipt_number.split('-')[2], 10)
    sequence = lastSeq + 1
  }

  return `${prefix}-${String(sequence).padStart(4, '0')}`
}
