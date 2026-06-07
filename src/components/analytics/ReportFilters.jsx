import { Calendar } from 'lucide-react'
import { REPORT_FILTERS } from '../../utils/dateRanges'
import { getTodayDateInput } from '../../utils/formatters'

export default function ReportFilters({
  filter,
  onFilterChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Business insights across revenue, orders, and customers</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {REPORT_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
                filter === f.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'custom' && (
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
          <Calendar size={18} className="hidden text-gray-400 sm:block" />
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">Start Date</label>
              <input
                type="date"
                value={customStart}
                max={customEnd || getTodayDateInput()}
                onChange={(e) => onCustomStartChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-500">End Date</label>
              <input
                type="date"
                value={customEnd}
                min={customStart}
                max={getTodayDateInput()}
                onChange={(e) => onCustomEndChange(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
