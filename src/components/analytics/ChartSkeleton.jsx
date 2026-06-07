export default function ChartSkeleton({ height = 280 }) {
  return (
    <div className="animate-pulse space-y-3" style={{ minHeight: height }}>
      <div className="h-4 w-1/3 rounded bg-gray-200" />
      <div className="rounded-lg bg-gray-100" style={{ height: height - 40 }} />
    </div>
  )
}
