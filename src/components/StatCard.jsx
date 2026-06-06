export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-gray-400">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 ${colors[color]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}
