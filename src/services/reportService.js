import { supabase } from '../lib/supabase'
import { getTodayRange, getWeekRange, getMonthRange } from '../utils/formatters'

async function getRevenueInRange(start, end) {
  const { data, error } = await supabase
    .from('receipts')
    .select('total_amount')
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) throw error

  const revenue = data.reduce((sum, r) => sum + Number(r.total_amount), 0)
  return { revenue, count: data.length }
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

export async function getTotalReceipts() {
  const { count, error } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count || 0
}

export async function getDashboardStats() {
  const [daily, weekly, monthly, totalReceipts, recentReceipts] = await Promise.all([
    getDailyRevenue(),
    getWeeklyRevenue(),
    getMonthlyRevenue(),
    getTotalReceipts(),
    supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (recentReceipts.error) throw recentReceipts.error

  return {
    todayRevenue: daily.revenue,
    todayOrders: daily.count,
    weeklyRevenue: weekly.revenue,
    monthlyRevenue: monthly.revenue,
    totalReceipts,
    recentReceipts: recentReceipts.data,
  }
}
