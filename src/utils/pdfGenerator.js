import jsPDF from 'jspdf'
import { RESTAURANT } from './constants'
import { formatCurrency, formatDateTime } from './formatters'

export function downloadReceiptPDF(order, receipt, items) {
  const doc = new jsPDF({ unit: 'mm', format: [80, 220] })
  const margin = 5
  let y = margin
  const lineHeight = 4
  const pageWidth = 80
  const customer = order.customers

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
    doc.line(margin, y, pageWidth - margin, y)
    y += lineHeight
  }

  addLine(RESTAURANT.name, { align: 'center', bold: true, size: 11 })
  if (RESTAURANT.address) addLine(RESTAURANT.address, { align: 'center', size: 7 })
  y += 2
  addDivider()

  addLine(`Receipt: ${receipt.receipt_number}`, { bold: true })
  addLine(`Date: ${formatDateTime(receipt.created_at || order.created_at)}`)
  if (customer?.name) addLine(`Customer: ${customer.name}`)
  if (customer?.phone) addLine(`Phone: ${customer.phone}`)
  if (customer?.address) {
    customer.address.split('\n').forEach((line) => addLine(line, { size: 8 }))
  }
  y += 1
  addDivider()

  addLine('Item          Qty    Amount', { bold: true, size: 8 })
  addDivider()

  items.forEach((item) => {
    const name = item.item_name.length > 14
      ? item.item_name.slice(0, 14) + '..'
      : item.item_name.padEnd(16, ' ')
    addLine(`${name}${String(item.quantity).padStart(3, ' ')}${formatCurrency(item.item_total).padStart(10, ' ')}`, { size: 8 })
  })

  y += 1
  addDivider()
  addLine(`TOTAL:${formatCurrency(order.total_amount).padStart(27, ' ')}`, { bold: true, size: 10 })
  y += 2
  addDivider()
  addLine(RESTAURANT.thankYouMessage, { align: 'center', size: 7 })

  doc.save(`${receipt.receipt_number}.pdf`)
}
