import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner className="mx-auto" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 font-semibold text-gray-600"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-gray-50 transition ${
                onRowClick ? 'cursor-pointer hover:bg-primary-50/50' : ''
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-700">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
