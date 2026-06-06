import jsPDF from 'jspdf'
import { RESTAURANT } from './constants'
import { formatCurrency, formatDateTime } from './formatters'

/**
 * Generate and download receipt as PDF using jsPDF
 */
export function downloadReceiptPDF(receipt, items) {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200],
  })

  const margin = 5
  let y = margin
  const lineHeight = 4
  const pageWidth = 80

  const addLine = (text, options = {}) => {
    const { align = 'left', bold = false, size = 9 } = options
    doc.setFontSize(size)
    doc.setFont('courier', bold ? 'bold' : 'normal')

    if (align === 'center') {
      doc.text(text, pageWidth / 2, y, { align: 'center' })
    } else {
      doc.text(text, margin, y)
    }
    y += lineHeight
  }

  const addDivider = () => {
    doc.setLineWidth(0.1)
    doc.line(margin, y, pageWidth - margin, y)
    y += lineHeight
  }

  // Header
  addLine(RESTAURANT.name, { align: 'center', bold: true, size: 11 })
  y += 2
  addDivider()

  addLine(`Receipt: ${receipt.receipt_number}`, { bold: true })
  addLine(`Date: ${formatDateTime(receipt.created_at)}`)
  if (receipt.customer_name) addLine(`Customer: ${receipt.customer_name}`)
  if (receipt.customer_phone) addLine(`Phone: ${receipt.customer_phone}`)
  if (receipt.customer_address) {
    const addressLines = receipt.customer_address.split('\n').filter(Boolean)
    addLine('Delivery Address:', { bold: true, size: 8 })
    addressLines.forEach((line) => addLine(line, { size: 8 }))
  }
  y += 1
  addDivider()

  // Items header
  addLine('Item          Qty    Amount', { bold: true, size: 8 })
  addDivider()

  items.forEach((item) => {
    const name = item.item_name.length > 14
      ? item.item_name.slice(0, 14) + '..'
      : item.item_name.padEnd(16, ' ')
    const qty = String(item.quantity).padStart(3, ' ')
    const total = formatCurrency(item.item_total).padStart(10, ' ')
    addLine(`${name}${qty}${total}`, { size: 8 })
  })

  y += 1
  addDivider()

  addLine(`TOTAL:${formatCurrency(receipt.total_amount).padStart(27, ' ')}`, { bold: true, size: 10 })
  y += 2
  addDivider()

  addLine(RESTAURANT.thankYouMessage, { align: 'center', size: 7 })

  doc.save(`${receipt.receipt_number}.pdf`)
}
