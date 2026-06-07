import { ORDER_STATUSES } from '../utils/constants'

export default function OrderStatusBadge({ status }) {
  const config = ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0]
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}
