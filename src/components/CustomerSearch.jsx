import { useState, useEffect, useRef } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { searchCustomers } from '../services/customerService'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

export default function CustomerSearch({ onSelect, onNewCustomer }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debouncedQuery = useDebouncedValue(query, 300)
  const ref = useRef(null)

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }
    setLoading(true)
    searchCustomers(debouncedQuery)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (customer) => {
    onSelect(customer)
    setQuery(customer.name)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search customer by name or phone..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        />
      </div>

      {open && (query || results.length > 0) && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
          {loading && (
            <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
          )}
          {!loading && results.length === 0 && query && (
            <button
              onClick={() => {
                setOpen(false)
                onNewCustomer?.(query)
              }}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-primary-600 hover:bg-primary-50"
            >
              <UserPlus size={16} />
              Create new customer &quot;{query}&quot;
            </button>
          )}
          {results.map((customer) => (
            <button
              key={customer.id}
              onClick={() => handleSelect(customer)}
              className="flex w-full flex-col border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-primary-50"
            >
              <span className="font-medium text-gray-900">{customer.name}</span>
              <span className="text-xs text-gray-500">{customer.phone}</span>
              {customer.address && (
                <span className="text-xs text-gray-400">{customer.address}</span>
              )}
              <span className="mt-1 text-xs capitalize text-primary-600">
                {customer.customer_type} customer
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
