import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import { PIE_COLORS } from '../../utils/chartColors'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-semibold text-gray-900">{item.name}</p>
      <p className="text-primary-600">{formatCurrency(item.value)}</p>
      <p className="text-xs text-gray-500">{item.payload.percent?.toFixed(1)}% share</p>
    </div>
  )
}

export default function CategoryPieChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const enriched = data.map((d) => ({ ...d, percent: total > 0 ? (d.value / total) * 100 : 0 }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={enriched}
          cx="50%"
          cy="50%"
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
        >
          {enriched.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
