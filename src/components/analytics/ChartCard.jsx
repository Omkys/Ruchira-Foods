import ChartSkeleton from './ChartSkeleton'
import EmptyState from '../EmptyState'
import { BarChart3 } from 'lucide-react'

export default function ChartCard({ title, subtitle, loading, empty, emptyMessage, children, height = 300 }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {loading ? (
        <ChartSkeleton height={height} />
      ) : empty ? (
        <EmptyState message={emptyMessage || 'No data for this period'} icon={BarChart3} />
      ) : (
        <div style={{ minHeight: height }}>{children}</div>
      )}
    </div>
  )
}
