import { RESTAURANT } from '../utils/constants'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function ReceiptPreview({ receipt, items, className = '' }) {
  if (!receipt) return null

  return (
    <div
      className={`receipt-print-area mx-auto w-full max-w-xs rounded-lg border border-gray-200 bg-white p-6 font-mono text-sm text-black shadow-sm ${className}`}
    >
      <div className="text-center">
        <h3 className="text-base font-bold uppercase tracking-wide">
          {RESTAURANT.name}
        </h3>
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="space-y-1 text-xs">
        <p>
          <span className="font-semibold">Receipt:</span> {receipt.receipt_number}
        </p>
        <p>
          <span className="font-semibold">Date:</span>{' '}
          {formatDateTime(receipt.created_at || new Date().toISOString())}
        </p>
        {receipt.customer_name && (
          <p>
            <span className="font-semibold">Customer:</span> {receipt.customer_name}
          </p>
        )}
        {receipt.customer_phone && (
          <p>
            <span className="font-semibold">Phone:</span> {receipt.customer_phone}
          </p>
        )}
        {receipt.customer_address && (
          <p>
            <span className="font-semibold">Delivery Address:</span>{' '}
            {receipt.customer_address}
          </p>
        )}
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="mb-1 flex justify-between text-xs font-semibold">
        <span>Item</span>
        <span>Qty</span>
        <span>Amount</span>
      </div>
      <div className="border-t border-dashed border-gray-400" />

      <div className="mt-2 space-y-1">
        {items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-xs">
            <span className="flex-1 truncate pr-2">{item.item_name || item.name}</span>
            <span className="w-8 text-center">{item.quantity}</span>
            <span className="w-16 text-right">
              {formatCurrency(item.item_total || item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <div className="flex justify-between border-t border-gray-400 pt-1 text-sm font-bold">
        <span>TOTAL</span>
        <span>{formatCurrency(receipt.total_amount)}</span>
      </div>

      <div className="my-3 border-t border-dashed border-gray-400" />

      <p className="text-center text-xs text-gray-600">
        {RESTAURANT.thankYouMessage}
      </p>
    </div>
  )
}
