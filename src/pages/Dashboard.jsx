import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee,
  ShoppingBag,
  Receipt,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import { getDashboardStats } from '../services/reportService'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getDashboardStats()
      setStats(data)
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
        <p className="font-medium">Failed to load dashboard</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadStats}
          className="mt-2 text-sm font-medium underline"
        >
          Retry
        </button>
      </div>
    )
  }

  const recentColumns = [
    {
      key: 'receipt_number',
      label: 'Receipt #',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-primary-600">
          {row.receipt_number}
        </span>
      ),
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (row) => row.customer_name || '—',
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.total_amount)}</span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => formatDateTime(row.created_at),
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          icon={IndianRupee}
          color="green"
          trend={`${stats.todayOrders} orders today`}
        />
        <StatCard
          title="Orders Today"
          value={stats.todayOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatCard
          title="Total Receipts"
          value={stats.totalReceipts}
          icon={Receipt}
          color="primary"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={TrendingUp}
          color="purple"
          trend={`Weekly: ${formatCurrency(stats.weeklyRevenue)}`}
        />
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Receipts</h2>
          <Link
            to="/history"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <DataTable
          columns={recentColumns}
          data={stats.recentReceipts}
          emptyMessage="No receipts generated yet"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/generate"
          className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 p-6 transition hover:bg-primary-100"
        >
          <div>
            <h3 className="font-semibold text-primary-900">Generate New Receipt</h3>
            <p className="mt-1 text-sm text-primary-700">
              Create a bill and print receipt
            </p>
          </div>
          <Receipt className="text-primary-600" size={32} />
        </Link>
        <Link
          to="/menu"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 transition hover:bg-gray-50"
        >
          <div>
            <h3 className="font-semibold text-gray-900">Manage Menu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add, edit, or remove food items
            </p>
          </div>
          <ShoppingBag className="text-gray-400" size={32} />
        </Link>
      </div>
    </div>
  )
}
