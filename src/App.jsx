import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import ToastContainer from './components/Toast'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DineIn from './pages/DineIn'
import TakeawayDelivery from './pages/TakeawayDelivery'
import History from './pages/History'
import Customers from './pages/Customers'
import MonthlyPlans from './pages/MonthlyPlans'
import MenuManagement from './pages/MenuManagement'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dine-in" element={<DineIn />} />
              <Route path="delivery-order" element={<TakeawayDelivery />} />
              <Route path="takeaway" element={<Navigate to="/delivery-order" replace />} />
              <Route path="history" element={<History />} />
              <Route path="delivery" element={<Navigate to="/history" replace />} />
              <Route path="customers" element={<Customers />} />
              <Route path="plans" element={<MonthlyPlans />} />
              <Route path="menu" element={<MenuManagement />} />
              <Route path="reports" element={<Reports />} />
              {/* Legacy route redirects */}
              <Route path="generate" element={<Navigate to="/delivery-order" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
