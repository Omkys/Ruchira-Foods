import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Utensils,
  ShoppingBag,
  History,
  Users,
  Calendar,
  BarChart3,
  LogOut,
  ChefHat,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NAV_ITEMS } from '../utils/constants'

const iconMap = {
  LayoutDashboard,
  Utensils,
  ShoppingBag,
  History,
  Users,
  Calendar,
  UtensilsCrossed,
  BarChart3,
}

export default function Sidebar({ isOpen, onClose }) {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gray-900 text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-gray-800 px-6 py-5">
          <div className="rounded-lg bg-primary-600 p-2">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Ruchira Foods</h1>
            <p className="text-xs text-gray-400">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-gray-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-red-600/20 hover:text-red-400"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
