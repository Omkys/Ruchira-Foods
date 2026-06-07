export const REPORT_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'last_7_days', label: 'Last 7 Days' },
  { id: 'last_30_days', label: 'Last 30 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'custom', label: 'Custom Range' },
]

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getFilterDateRange(filterId, customStart, customEnd) {
  const now = new Date()

  switch (filterId) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'last_7_days': {
      const start = startOfDay(now)
      start.setDate(start.getDate() - 6)
      return { start, end: endOfDay(now) }
    }
    case 'last_30_days': {
      const start = startOfDay(now)
      start.setDate(start.getDate() - 29)
      return { start, end: endOfDay(now) }
    }
    case 'this_month':
      return {
        start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      }
    case 'last_month':
      return {
        start: startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      }
    case 'custom': {
      if (!customStart || !customEnd) return null
      return { start: startOfDay(new Date(customStart)), end: endOfDay(new Date(customEnd)) }
    }
    default:
      return getFilterDateRange('last_7_days')
  }
}

export function getPreviousPeriodRange(start, end) {
  const duration = end.getTime() - start.getTime()
  const prevEnd = new Date(start.getTime() - 1)
  const prevStart = new Date(prevEnd.getTime() - duration)
  return { start: startOfDay(prevStart), end: endOfDay(prevEnd) }
}

export function getTrendGranularity(start, end) {
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  if (days <= 14) return 'daily'
  if (days <= 90) return 'weekly'
  return 'monthly'
}

export function formatTrendLabel(date, granularity) {
  if (granularity === 'daily') {
    return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date)
  }
  if (granularity === 'weekly') {
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(date)
  }
  return new Intl.DateTimeFormat('en-IN', { month: 'short', year: '2-digit' }).format(date)
}

export function generateBuckets(start, end, granularity) {
  const buckets = []
  const cursor = startOfDay(new Date(start))

  if (granularity === 'daily') {
    while (cursor <= end) {
      const bucketEnd = endOfDay(new Date(cursor))
      buckets.push({
        key: cursor.toISOString().slice(0, 10),
        label: formatTrendLabel(cursor, 'daily'),
        start: new Date(cursor),
        end: bucketEnd > end ? end : bucketEnd,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    return buckets
  }

  if (granularity === 'weekly') {
    while (cursor <= end) {
      const bucketEnd = endOfDay(new Date(cursor))
      bucketEnd.setDate(bucketEnd.getDate() + 6)
      const actualEnd = bucketEnd > end ? end : bucketEnd
      buckets.push({
        key: cursor.toISOString().slice(0, 10),
        label: formatTrendLabel(cursor, 'weekly'),
        start: new Date(cursor),
        end: actualEnd,
      })
      cursor.setDate(cursor.getDate() + 7)
    }
    return buckets
  }

  const monthCursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (monthCursor <= end) {
    const monthStart = startOfDay(new Date(monthCursor))
    const monthEnd = endOfDay(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0))
    buckets.push({
      key: `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, '0')}`,
      label: formatTrendLabel(monthCursor, 'monthly'),
      start: monthStart < start ? start : monthStart,
      end: monthEnd > end ? end : monthEnd,
    })
    monthCursor.setMonth(monthCursor.getMonth() + 1)
  }
  return buckets
}

export function isInRange(dateStr, bucketStart, bucketEnd) {
  const d = new Date(dateStr).getTime()
  return d >= bucketStart.getTime() && d <= bucketEnd.getTime()
}

export function calcGrowth(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}
