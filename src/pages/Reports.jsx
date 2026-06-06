import { useEffect, useState } from 'react'
import {
  IndianRupee,
  Receipt,
  Calendar,
  CalendarDays,
  CalendarRange,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  getDailyRevenue,
  getWeeklyRevenue,
  getMonthlyRevenue,
  getTotalReceipts,
} from '../services/reportService'
import { formatCurrency } from '../utils/formatters'

export default function Reports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const [daily, weekly, monthly, total] = await Promise.all([
        getDailyRevenue(),
        getWeeklyRevenue(),
        getMonthlyRevenue(),
        getTotalReceipts(),
      ])
      setReports({ daily, weekly, monthly, total })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Failed to load reports</p>
        <p className="text-sm">{error}</p>
        <button onClick={loadReports} className="mt-2 text-sm underline">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Daily Revenue"
          value={formatCurrency(reports.daily.revenue)}
          icon={Calendar}
          color="green"
          trend={`${reports.daily.count} receipts today`}
        />
        <StatCard
          title="Weekly Revenue"
          value={formatCurrency(reports.weekly.revenue)}
          icon={CalendarDays}
          color="blue"
          trend={`${reports.weekly.count} receipts this week`}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(reports.monthly.revenue)}
          icon={CalendarRange}
          color="purple"
          trend={`${reports.monthly.count} receipts this month`}
        />
        <StatCard
          title="Total Receipts"
          value={reports.total}
          icon={Receipt}
          color="primary"
          trend="All time"
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Revenue Summary
        </h2>
        <div className="space-y-4">
          {[
            {
              label: 'Today',
              revenue: reports.daily.revenue,
              count: reports.daily.count,
              color: 'bg-green-500',
            },
            {
              label: 'This Week',
              revenue: reports.weekly.revenue,
              count: reports.weekly.count,
              color: 'bg-blue-500',
            },
            {
              label: 'This Month',
              revenue: reports.monthly.revenue,
              count: reports.monthly.count,
              color: 'bg-purple-500',
            },
          ].map((period) => {
            const maxRevenue = Math.max(
              reports.daily.revenue,
              reports.weekly.revenue,
              reports.monthly.revenue,
              1
            )
            const percentage = (period.revenue / maxRevenue) * 100

            return (
              <div key={period.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{period.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{period.count} orders</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(period.revenue)}
                    </span>
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${period.color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
          <IndianRupee className="mx-auto text-green-600" size={28} />
          <p className="mt-2 text-sm text-green-700">Avg. Daily Order Value</p>
          <p className="mt-1 text-xl font-bold text-green-900">
            {reports.daily.count > 0
              ? formatCurrency(reports.daily.revenue / reports.daily.count)
              : formatCurrency(0)}
          </p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
          <IndianRupee className="mx-auto text-blue-600" size={28} />
          <p className="mt-2 text-sm text-blue-700">Avg. Weekly Order Value</p>
          <p className="mt-1 text-xl font-bold text-blue-900">
            {reports.weekly.count > 0
              ? formatCurrency(reports.weekly.revenue / reports.weekly.count)
              : formatCurrency(0)}
          </p>
        </div>
        <div className="rounded-xl border border-purple-100 bg-purple-50 p-6 text-center">
          <IndianRupee className="mx-auto text-purple-600" size={28} />
          <p className="mt-2 text-sm text-purple-700">Avg. Monthly Order Value</p>
          <p className="mt-1 text-xl font-bold text-purple-900">
            {reports.monthly.count > 0
              ? formatCurrency(reports.monthly.revenue / reports.monthly.count)
              : formatCurrency(0)}
          </p>
        </div>
      </div>
    </div>
  )
}
