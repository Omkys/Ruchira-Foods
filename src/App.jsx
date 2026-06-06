import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import ToastContainer from './components/Toast'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import ReceiptGenerator from './pages/ReceiptGenerator'
import ReceiptHistory from './pages/ReceiptHistory'
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
              <Route path="menu" element={<MenuManagement />} />
              <Route path="generate" element={<ReceiptGenerator />} />
              <Route path="history" element={<ReceiptHistory />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
