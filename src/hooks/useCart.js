import { useState, useCallback } from 'react'

export function useCart() {
  const [cart, setCart] = useState({})

  const addItem = useCallback((itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))
  }, [])

  const updateQuantity = useCallback((itemId, delta) => {
    setCart((prev) => {
      const current = prev[itemId] || 0
      const newQty = Math.max(0, current + delta)
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [itemId]: newQty }
    })
  }, [])

  const setQuantity = useCallback((itemId, value) => {
    const qty = parseInt(value, 10) || 0
    if (qty <= 0) {
      setCart((prev) => {
        const { [itemId]: _, ...rest } = prev
        return rest
      })
    } else {
      setCart((prev) => ({ ...prev, [itemId]: qty }))
    }
  }, [])

  const removeItem = useCallback((itemId) => {
    setCart((prev) => {
      const { [itemId]: _, ...rest } = prev
      return rest
    })
  }, [])

  const clearCart = useCallback(() => setCart({}), [])

  return { cart, addItem, updateQuantity, setQuantity, removeItem, clearCart }
}
