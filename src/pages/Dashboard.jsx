import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Truck,
  Calendar,
  Utensils,
  ArrowRight,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import OrderStatusBadge from '../components/OrderStatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { getDashboardStats } from '../services/reportService'
import { formatCurrency, formatDateTime } from '../utils/formatters'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const recentColumns = [
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <span className="capitalize text-xs font-medium">{row.order_type?.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => row.customers?.name || (row.table_number ? `Table ${row.table_number}` : '—'),
    },
    {
      key: 'total',
      label: 'Amount',
      render: (row) => <span className="font-semibold">{formatCurrency(row.total_amount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <OrderStatusBadge status={row.status} />,
    },
    {
      key: 'date',
      label: 'Date',
      render: (row) => formatDateTime(row.created_at),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Workflow Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/dine-in"
          className="group flex items-center justify-between rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-8 transition hover:border-primary-400 hover:shadow-lg"
        >
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Utensils size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Dine In</h2>
            <p className="mt-2 text-sm text-gray-500">
              Select table, add items, generate bill & receipt
            </p>
          </div>
          <ArrowRight className="text-primary-400 transition group-hover:translate-x-1 group-hover:text-primary-600" size={28} />
        </Link>

        <Link
          to="/delivery-order"
          className="group flex items-center justify-between rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 transition hover:border-blue-400 hover:shadow-lg"
        >
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Truck size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Delivery</h2>
            <p className="mt-2 text-sm text-gray-500">
              Search customers, create delivery orders, generate receipts
            </p>
          </div>
          <ArrowRight className="text-blue-400 transition group-hover:translate-x-1 group-hover:text-blue-600" size={28} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Today's Revenue" value={formatCurrency(stats.todayRevenue)} icon={IndianRupee} color="green" />
        <StatCard title="Orders Today" value={stats.todayOrders} icon={ShoppingBag} color="blue" />
        <StatCard title="Monthly Customers" value={stats.monthlyCustomers} icon={Users} color="purple" />
        <StatCard title="Pending Deliveries" value={stats.pendingDeliveries} icon={Truck} color="primary" />
        <StatCard title="Active Monthly Plans" value={stats.activePlans} icon={Calendar} color="green" />
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Orders</h2>
        <DataTable
          columns={recentColumns}
          data={stats.recentOrders}
          emptyMessage="No orders yet"
        />
      </div>
    </div>
  )
}
