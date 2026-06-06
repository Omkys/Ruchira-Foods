import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

export default function ActionMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        aria-label="More actions"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                item.onClick()
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
