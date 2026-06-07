import { useEffect, useState } from 'react'
import {
  IndianRupee,
  ShoppingBag,
  Truck,
  Users,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getFullReports } from '../services/reportService'
import { formatCurrency } from '../utils/formatters'

export default function Reports() {
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFullReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><LoadingSpinner size="lg" /></div>
  }

  const periods = [
    { label: 'Today', ...reports.daily, color: 'bg-green-500' },
    { label: 'This Week', ...reports.weekly, color: 'bg-blue-500' },
    { label: 'This Month', ...reports.monthly, color: 'bg-purple-500' },
  ]
  const maxRevenue = Math.max(...periods.map((p) => p.revenue), 1)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Daily Revenue" value={formatCurrency(reports.daily.revenue)} icon={IndianRupee} color="green" trend={`${reports.daily.count} orders`} />
        <StatCard title="Weekly Revenue" value={formatCurrency(reports.weekly.revenue)} icon={TrendingUp} color="blue" trend={`${reports.weekly.count} orders`} />
        <StatCard title="Monthly Revenue" value={formatCurrency(reports.monthly.revenue)} icon={Calendar} color="purple" trend={`${reports.monthly.count} orders`} />
        <StatCard title="Total Deliveries (Month)" value={reports.monthly.deliveries} icon={Truck} color="primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Monthly Customers" value={reports.monthlyCustomers} icon={Users} color="purple" />
        <StatCard title="Active Monthly Plans" value={reports.activePlans} icon={Calendar} color="green" />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold">Revenue Summary</h2>
        <div className="space-y-4">
          {periods.map((period) => (
            <div key={period.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium">{period.label}</span>
                <div className="flex gap-3">
                  <span className="text-gray-400">{period.count} orders</span>
                  <span className="font-semibold">{formatCurrency(period.revenue)}</span>
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${period.color}`} style={{ width: `${(period.revenue / maxRevenue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Top Selling Items (This Month)</h2>
        {reports.topItems.length === 0 ? (
          <p className="text-sm text-gray-400">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {reports.topItems.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-gray-500">{item.quantity} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
