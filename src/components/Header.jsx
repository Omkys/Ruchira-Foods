import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Header({ title, onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
          <Bell size={20} />
        </button>
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Admin</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
