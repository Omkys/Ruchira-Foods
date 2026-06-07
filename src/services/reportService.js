import { supabase } from '../lib/supabase'
import { getTodayRange, getWeekRange, getMonthRange } from '../utils/formatters'
import { getMonthlyCustomerCount } from './customerService'
import { getActivePlansCount } from './monthlyPlanService'
import { getPendingDeliveriesCount } from './orderService'

async function getRevenueInRange(start, end) {
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, order_type')
    .gte('created_at', start)
    .lte('created_at', end)
    .neq('status', 'cancelled')

  if (error) throw error

  const revenue = data.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const deliveries = data.filter((o) => o.order_type === 'delivery').length
  return { revenue, count: data.length, deliveries }
}

export async function getDailyRevenue() {
  const { start, end } = getTodayRange()
  return getRevenueInRange(start, end)
}

export async function getWeeklyRevenue() {
  const { start, end } = getWeekRange()
  return getRevenueInRange(start, end)
}

export async function getMonthlyRevenue() {
  const { start, end } = getMonthRange()
  return getRevenueInRange(start, end)
}

export async function getTopSellingItems(limit = 5) {
  const { start } = getMonthRange()

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .gte('created_at', start)
    .neq('status', 'cancelled')

  if (ordersError) throw ordersError
  if (!orders?.length) return []

  const orderIds = orders.map((o) => o.id)
  const { data, error } = await supabase
    .from('order_items')
    .select('item_name, quantity')
    .in('order_id', orderIds)

  if (error) throw error

  const totals = {}
  data.forEach((item) => {
    totals[item.item_name] = (totals[item.item_name] || 0) + item.quantity
  })

  return Object.entries(totals)
    .map(([name, qty]) => ({ name, quantity: qty }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit)
}

export async function getDashboardStats() {
  const [daily, monthlyCustomers, pendingDeliveries, activePlans] = await Promise.all([
    getDailyRevenue(),
    getMonthlyCustomerCount(),
    getPendingDeliveriesCount(),
    getActivePlansCount(),
  ])

  const { data: recentOrders, error } = await supabase
    .from('orders')
    .select('*, customers(*), receipts(*)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) throw error

  return {
    todayRevenue: daily.revenue,
    todayOrders: daily.count,
    monthlyCustomers,
    pendingDeliveries,
    activePlans,
    recentOrders,
  }
}

export async function getFullReports() {
  const [daily, weekly, monthly, monthlyCustomers, activePlans, topItems] =
    await Promise.all([
      getDailyRevenue(),
      getWeeklyRevenue(),
      getMonthlyRevenue(),
      getMonthlyCustomerCount(),
      getActivePlansCount(),
      getTopSellingItems(),
    ])

  return { daily, weekly, monthly, monthlyCustomers, activePlans, topItems }
}
