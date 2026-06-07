import { useCallback, useEffect, useState } from 'react'
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Truck,
  TrendingUp,
  UserPlus,
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { fetchAnalyticsReport } from '../services/analyticsService'
import { REPORT_FILTERS } from '../utils/dateRanges'
import ReportFilters from '../components/analytics/ReportFilters'
import KpiCard from '../components/analytics/KpiCard'
import ChartCard from '../components/analytics/ChartCard'
import RevenueTrendChart from '../components/analytics/RevenueTrendChart'
import OrderTrendChart from '../components/analytics/OrderTrendChart'
import TopSellingChart from '../components/analytics/TopSellingChart'
import CategoryPieChart from '../components/analytics/CategoryPieChart'

export default function Reports() {
  const { addToast } = useToast()
  const [filter, setFilter] = useState('last_7_days')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const filterLabel = REPORT_FILTERS.find((f) => f.id === filter)?.label || filter

  const loadReport = useCallback(async () => {
    if (filter === 'custom' && (!customStart || !customEnd)) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchAnalyticsReport({ filter, customStart, customEnd })
      setReport(data)
    } catch (err) {
      addToast(err.message || 'Failed to load reports', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter, customStart, customEnd, addToast])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const hasRevenue = report?.revenueTrend?.some((d) => d.revenue > 0)
  const hasOrders = report?.orderTrend?.some((d) => d.dine_in + d.takeaway + d.delivery > 0)

  return (
    <div className="space-y-6">
      <ReportFilters
        filter={filter}
        onFilterChange={setFilter}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
      />

      <p className="text-sm text-gray-500">
        Showing data for <span className="font-medium text-gray-700">{filterLabel}</span>
      </p>

      {/* KPI Cards */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Key Metrics</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <KpiCard
            title="Total Revenue"
            value={report?.kpis?.totalRevenue?.value ?? 0}
            growth={report?.kpis?.totalRevenue?.growth}
            icon={IndianRupee}
            isCurrency
            color="green"
          />
          <KpiCard
            title="Total Orders"
            value={report?.kpis?.totalOrders?.value ?? 0}
            growth={report?.kpis?.totalOrders?.growth}
            icon={ShoppingBag}
            color="blue"
          />
          <KpiCard
            title="Active Monthly Customers"
            value={report?.kpis?.activeMonthlyCustomers?.value ?? 0}
            growth={report?.kpis?.activeMonthlyCustomers?.growth}
            icon={Users}
            color="purple"
          />
          <KpiCard
            title="Total Deliveries"
            value={report?.kpis?.totalDeliveries?.value ?? 0}
            growth={report?.kpis?.totalDeliveries?.growth}
            icon={Truck}
            color="primary"
          />
          <KpiCard
            title="Average Order Value"
            value={report?.kpis?.averageOrderValue?.value ?? 0}
            growth={report?.kpis?.averageOrderValue?.growth}
            icon={TrendingUp}
            isCurrency
            color="amber"
          />
          <KpiCard
            title="New Customers Added"
            value={report?.kpis?.newCustomers?.value ?? 0}
            growth={report?.kpis?.newCustomers?.growth}
            icon={UserPlus}
            color="green"
          />
        </div>
      </section>

      {/* Revenue Analytics */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Revenue Analytics</h2>
        <ChartCard
          title="Revenue Trend"
          subtitle="Daily, weekly, or monthly revenue based on selected period"
          loading={loading}
          empty={!hasRevenue}
        >
          <RevenueTrendChart data={report?.revenueTrend || []} />
        </ChartCard>
      </section>

      {/* Order Analytics */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Order Analytics</h2>
        <ChartCard
          title="Orders by Type"
          subtitle="Stacked comparison of Dine In, Take Away, and Delivery"
          loading={loading}
          empty={!hasOrders}
        >
          <OrderTrendChart data={report?.orderTrend || []} />
        </ChartCard>
      </section>

      {/* Top Selling & Category */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Menu Performance</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard
            title="Top Selling Items"
            subtitle="Top 10 items by quantity sold"
            loading={loading}
            empty={!report?.topSellingItems?.length}
            height={Math.max(300, (report?.topSellingItems?.length || 0) * 36)}
          >
            <TopSellingChart data={report?.topSellingItems || []} />
          </ChartCard>

          <ChartCard
            title="Category Performance"
            subtitle="Revenue share by menu category"
            loading={loading}
            empty={!report?.categoryPerformance?.length}
          >
            <CategoryPieChart data={report?.categoryPerformance || []} />
          </ChartCard>
        </div>
      </section>
    </div>
  )
}
