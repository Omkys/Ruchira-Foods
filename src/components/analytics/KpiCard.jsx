import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'

export default function KpiCard({ title, value, growth, icon: Icon, isCurrency = false, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  const displayValue = isCurrency ? formatCurrency(value) : value

  const renderGrowth = () => {
    if (growth === null || growth === undefined) return null
    const isPositive = growth > 0
    const isNeutral = growth === 0
    const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown
    const colorClass = isNeutral ? 'text-gray-400' : isPositive ? 'text-green-600' : 'text-red-500'

    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        <TrendIcon size={14} />
        {isPositive ? '+' : ''}{growth}% vs previous period
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold text-gray-900">{displayValue}</p>
          <div className="mt-2">{renderGrowth()}</div>
        </div>
        {Icon && (
          <div className={`shrink-0 rounded-lg p-3 ${colors[color]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}
