import { useState, useEffect } from 'react'

/**
 * Returns a debounced version of the given value.
 * Useful for search inputs to avoid excessive API calls.
 */
export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
