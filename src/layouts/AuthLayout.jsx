import { ChefHat } from 'lucide-react'
import { RESTAURANT } from '../utils/constants'

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-gray-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-600 p-3">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{RESTAURANT.name}</h1>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            {RESTAURANT.name}
          </h2>
          <p className="mt-4 text-xl font-medium text-primary-300">
            {RESTAURANT.tagline}
          </p>
        </div>

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {RESTAURANT.name}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
