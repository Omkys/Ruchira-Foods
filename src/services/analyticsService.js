import { supabase } from '../lib/supabase'
import {
  getFilterDateRange,
  getPreviousPeriodRange,
  getTrendGranularity,
  generateBuckets,
  isInRange,
  calcGrowth,
} from '../utils/dateRanges'

async function fetchOrdersInRange(start, end, includeCancelled = true) {
  let query = supabase
    .from('orders')
    .select('id, customer_id, order_type, status, total_amount, created_at, order_items(item_name, price, quantity, item_total)')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (!includeCancelled) {
    query = query.neq('status', 'cancelled')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

async function fetchCustomersInRange(start, end) {
  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_type, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (error) throw error
  return data || []
}

async function fetchAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_type, created_at')

  if (error) throw error
  return data || []
}

async function fetchMonthlyPlansInRange(start, end) {
  const { data, error } = await supabase
    .from('monthly_plans')
    .select('id, customer_id, start_date, end_date, is_active, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (error) throw error
  return data || []
}

async function fetchAllMonthlyPlans() {
  const { data, error } = await supabase
    .from('monthly_plans')
    .select('id, customer_id, start_date, end_date, is_active, created_at')

  if (error) throw error
  return data || []
}

async function fetchActiveMonthlyCustomers() {
  const { count, error } = await supabase
    .from('monthly_plans')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (error) throw error
  return count || 0
}

async function fetchCustomerIdsBefore(date) {
  const { data, error } = await supabase
    .from('orders')
    .select('customer_id')
    .lt('created_at', date.toISOString())
    .not('customer_id', 'is', null)

  if (error) throw error
  return new Set((data || []).map((o) => o.customer_id))
}

async function fetchMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('name, category')

  if (error) throw error
  return data || []
}

function sumRevenue(orders) {
  return orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount), 0)
}

function countDeliveries(orders) {
  return orders.filter((o) => o.order_type === 'delivery' && o.status !== 'cancelled').length
}

function computeKpis(currentOrders, previousOrders, currentCustomers, previousCustomers, activeMonthlyCustomers) {
  const currentRevenue = sumRevenue(currentOrders)
  const previousRevenue = sumRevenue(previousOrders)
  const currentOrderCount = currentOrders.filter((o) => o.status !== 'cancelled').length
  const previousOrderCount = previousOrders.filter((o) => o.status !== 'cancelled').length
  const currentDeliveries = countDeliveries(currentOrders)
  const previousDeliveries = countDeliveries(previousOrders)
  const currentAov = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
  const previousAov = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0
  const newCustomers = currentCustomers.length
  const prevNewCustomers = previousCustomers.length

  return {
    totalRevenue: { value: currentRevenue, growth: calcGrowth(currentRevenue, previousRevenue) },
    totalOrders: { value: currentOrderCount, growth: calcGrowth(currentOrderCount, previousOrderCount) },
    activeMonthlyCustomers: { value: activeMonthlyCustomers, growth: null },
    totalDeliveries: { value: currentDeliveries, growth: calcGrowth(currentDeliveries, previousDeliveries) },
    averageOrderValue: { value: currentAov, growth: calcGrowth(currentAov, previousAov) },
    newCustomers: { value: newCustomers, growth: calcGrowth(newCustomers, prevNewCustomers) },
  }
}

function computeRevenueTrend(orders, start, end) {
  const granularity = getTrendGranularity(start, end)
  const buckets = generateBuckets(start, end, granularity)

  return buckets.map((bucket) => {
    const bucketOrders = orders.filter(
      (o) => o.status !== 'cancelled' && isInRange(o.created_at, bucket.start, bucket.end)
    )
    const revenue = sumRevenue(bucketOrders)
    return { label: bucket.label, revenue, orders: bucketOrders.length }
  })
}

function computeOrderTrend(orders, start, end) {
  const granularity = getTrendGranularity(start, end)
  const buckets = generateBuckets(start, end, granularity)

  return buckets.map((bucket) => {
    const bucketOrders = orders.filter(
      (o) => o.status !== 'cancelled' && isInRange(o.created_at, bucket.start, bucket.end)
    )
    return {
      label: bucket.label,
      dine_in: bucketOrders.filter((o) => o.order_type === 'dine_in').length,
      takeaway: bucketOrders.filter((o) => o.order_type === 'takeaway').length,
      delivery: bucketOrders.filter((o) => o.order_type === 'delivery').length,
    }
  })
}

function computeCustomerGrowth(orders, customers, start, end, returningBefore) {
  const granularity = getTrendGranularity(start, end)
  const buckets = generateBuckets(start, end, granularity)

  return buckets.map((bucket) => {
    const bucketCustomers = customers.filter((c) => isInRange(c.created_at, bucket.start, bucket.end))
    const bucketOrders = orders.filter(
      (o) => o.status !== 'cancelled' && o.customer_id && isInRange(o.created_at, bucket.start, bucket.end)
    )
    const orderCustomerIds = new Set(bucketOrders.map((o) => o.customer_id))
    let returning = 0
    orderCustomerIds.forEach((id) => {
      if (returningBefore.has(id)) returning++
    })

    return {
      label: bucket.label,
      newCustomers: bucketCustomers.length,
      returningCustomers: returning,
      monthlyCustomers: bucketCustomers.filter((c) => c.customer_type === 'monthly').length,
    }
  })
}

function computeMonthlyMessAnalytics(plans, allPlans, start, end) {
  const granularity = getTrendGranularity(start, end)
  const buckets = generateBuckets(start, end, granularity)

  return buckets.map((bucket) => {
    const bucketStart = bucket.start.toISOString().slice(0, 10)
    const bucketEnd = bucket.end.toISOString().slice(0, 10)

    const newPlans = plans.filter((p) => isInRange(p.created_at, bucket.start, bucket.end)).length

    const expiredPlans = allPlans.filter((p) => {
      const endDate = p.end_date
      return endDate >= bucketStart && endDate <= bucketEnd && !p.is_active
    }).length

    const renewedPlans = plans.filter((p) => {
      if (!isInRange(p.created_at, bucket.start, bucket.end)) return false
      const prior = allPlans.filter(
        (prev) => prev.customer_id === p.customer_id && prev.id !== p.id && prev.created_at < p.created_at
      )
      return prior.length > 0
    }).length

    const activePlans = allPlans.filter((p) => {
      return p.is_active && p.start_date <= bucketEnd && p.end_date >= bucketStart
    }).length

    return {
      label: bucket.label,
      activePlans,
      expiredPlans,
      renewedPlans,
      newPlans,
    }
  })
}

function computeDeliveryAnalytics(orders) {
  const deliveryOrders = orders.filter((o) => o.order_type === 'delivery')
  const statusGroups = {
    delivered: deliveryOrders.filter((o) => o.status === 'delivered').length,
    pending: deliveryOrders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status)).length,
    out_for_delivery: deliveryOrders.filter((o) => o.status === 'out_for_delivery').length,
    cancelled: deliveryOrders.filter((o) => o.status === 'cancelled').length,
  }

  return Object.entries(statusGroups)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value,
    }))
}

function computeTopSellingItems(orders, limit = 10) {
  const totals = {}

  orders
    .filter((o) => o.status !== 'cancelled')
    .forEach((order) => {
      order.order_items?.forEach((item) => {
        if (!totals[item.item_name]) {
          totals[item.item_name] = { name: item.item_name, quantity: 0, revenue: 0 }
        }
        totals[item.item_name].quantity += item.quantity
        totals[item.item_name].revenue += Number(item.item_total)
      })
    })

  return Object.values(totals)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

function computeCategoryPerformance(orders, menuItems) {
  const categoryMap = {}
  menuItems.forEach((m) => {
    categoryMap[m.name.toLowerCase()] = m.category
  })

  const totals = {}

  orders
    .filter((o) => o.status !== 'cancelled')
    .forEach((order) => {
      order.order_items?.forEach((item) => {
        const category = categoryMap[item.item_name.toLowerCase()] || 'Other'
        totals[category] = (totals[category] || 0) + Number(item.item_total)
      })
    })

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export async function fetchAnalyticsReport({ filter, customStart, customEnd }) {
  const range = getFilterDateRange(filter, customStart, customEnd)
  if (!range) throw new Error('Invalid date range')

  const previousRange = getPreviousPeriodRange(range.start, range.end)

  const [
    currentOrders,
    previousOrders,
    currentCustomers,
    previousCustomers,
    plansInRange,
    allPlans,
    activeMonthlyCustomers,
    returningBefore,
    menuItems,
  ] = await Promise.all([
    fetchOrdersInRange(range.start, range.end),
    fetchOrdersInRange(previousRange.start, previousRange.end),
    fetchCustomersInRange(range.start, range.end),
    fetchCustomersInRange(previousRange.start, previousRange.end),
    fetchMonthlyPlansInRange(range.start, range.end),
    fetchAllMonthlyPlans(),
    fetchActiveMonthlyCustomers(),
    fetchCustomerIdsBefore(range.start),
    fetchMenuItems(),
  ])

  const allCustomers = await fetchAllCustomers()

  return {
    filter,
    range: {
      start: range.start.toISOString(),
      end: range.end.toISOString(),
      label: filter,
    },
    kpis: computeKpis(
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      activeMonthlyCustomers
    ),
    revenueTrend: computeRevenueTrend(currentOrders, range.start, range.end),
    orderTrend: computeOrderTrend(currentOrders, range.start, range.end),
    customerGrowth: computeCustomerGrowth(
      currentOrders,
      allCustomers,
      range.start,
      range.end,
      returningBefore
    ),
    monthlyMess: computeMonthlyMessAnalytics(plansInRange, allPlans, range.start, range.end),
    deliveryAnalytics: computeDeliveryAnalytics(currentOrders),
    topSellingItems: computeTopSellingItems(currentOrders),
    categoryPerformance: computeCategoryPerformance(currentOrders, menuItems),
  }
}
