export const RESTAURANT = {
  name: 'Ruchira Foods',
  address: '',
  tagline: 'Where Every Meal Feels Like Home',
  thankYouMessage: 'Thank you for choosing Ruchira Foods! Visit again soon.',
}

export const CATEGORIES = [
  'Starters',
  'Main Course',
  'Breads',
  'Beverages',
  'Desserts',
  'Combos',
  'Other',
]

export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  DELIVERY: 'delivery',
}

export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { value: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
  { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800' },
  { value: 'out_for_delivery', label: 'Out For Delivery', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-gray-100 text-gray-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

export const KANBAN_COLUMNS = [
  'pending',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
]

export const CUSTOMER_TYPES = [
  { value: 'regular', label: 'Regular Customer' },
  { value: 'monthly', label: 'Monthly Mess Customer' },
]

export const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1)

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/dine-in', label: 'Dine In', icon: 'Utensils' },
  { path: '/delivery-order', label: 'Delivery', icon: 'ShoppingBag' },
  { path: '/history', label: 'History', icon: 'History' },
  { path: '/customers', label: 'Customers', icon: 'Users' },
  { path: '/plans', label: 'Monthly Plans', icon: 'Calendar' },
  { path: '/menu', label: 'Menu', icon: 'UtensilsCrossed' },
  { path: '/reports', label: 'Reports', icon: 'BarChart3' },
]
