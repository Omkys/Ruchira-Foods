import { useState, useEffect, useRef } from 'react'
import { UserPlus, CheckCircle, Calendar } from 'lucide-react'
import { searchCustomers, getCustomerById, getActiveMonthlyPlan } from '../services/customerService'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { CUSTOMER_TYPES } from '../utils/constants'
import { getTodayDateInput, formatDate } from '../utils/formatters'

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  customerType: 'regular',
  startDate: '',
  endDate: '',
  renewDate: '',
  planId: null,
}

export default function CustomerCard({
  selectedCustomer,
  onSelectCustomer,
  onClearCustomer,
  onSaveCustomer,
  onFormChange,
  saving = false,
}) {
  const [form, setForm] = useState(emptyForm)
  const [activePlan, setActivePlan] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [renewEditOpen, setRenewEditOpen] = useState(false)
  const debouncedName = useDebouncedValue(form.name, 300)
  const ref = useRef(null)

  const applyCustomerToForm = (customer, plan) => {
    const next = {
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      customerType: customer.customer_type || 'regular',
      startDate: '',
      endDate: '',
      renewDate: plan?.end_date?.slice(0, 10) || '',
      planId: plan?.id || null,
    }
    setForm(next)
    setActivePlan(plan)
    setRenewEditOpen(false)
    onFormChange?.(next)
  }

  useEffect(() => {
    if (!selectedCustomer?.id) return

    setLoadingPlan(true)
    getCustomerById(selectedCustomer.id)
      .then((full) => {
        const plan = getActiveMonthlyPlan(full)
        applyCustomerToForm(full, plan)
      })
      .catch(() => {
        applyCustomerToForm(selectedCustomer, null)
      })
      .finally(() => setLoadingPlan(false))
  }, [selectedCustomer?.id])

  useEffect(() => {
    if (!debouncedName || debouncedName.length < 1) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    searchCustomers(debouncedName)
      .then(setSearchResults)
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false))
  }, [debouncedName])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateForm = (updater) => {
    setForm((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      onFormChange?.(next)
      return next
    })
  }

  const clearSelection = () => {
    setActivePlan(null)
    onClearCustomer()
  }

  const handleNameChange = (name) => {
    updateForm((prev) => ({ ...prev, name }))
    if (selectedCustomer && name !== selectedCustomer.name) {
      clearSelection()
    }
    setDropdownOpen(true)
  }

  const handleSelectExisting = async (customer) => {
    setDropdownOpen(false)
    setLoadingPlan(true)
    try {
      const full = await getCustomerById(customer.id)
      const plan = getActiveMonthlyPlan(full)
      onSelectCustomer({ ...full, activePlan: plan })
      applyCustomerToForm(full, plan)
    } catch {
      onSelectCustomer(customer)
      applyCustomerToForm(customer, getActiveMonthlyPlan(customer))
    } finally {
      setLoadingPlan(false)
    }
  }

  const handleSave = async (mode = 'register') => {
    return onSaveCustomer?.(form, { mode })
  }

  const isExisting = !!selectedCustomer?.id
  const isExistingMonthly = isExisting && form.customerType === 'monthly' && activePlan
  const isExistingMonthlyNoPlan = isExisting && form.customerType === 'monthly' && !activePlan
  const isNewMonthly = form.customerType === 'monthly' && !isExisting

  const hasProfileChanges = isExisting && selectedCustomer && (
    form.phone !== selectedCustomer.phone ||
    form.address !== (selectedCustomer.address || '') ||
    form.customerType !== selectedCustomer.customer_type
  )
  const showDropdown = dropdownOpen && form.name.length > 0

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Customer</h2>
          <p className="text-sm text-gray-500">Step 2 — Enter delivery details</p>
        </div>
        {isExisting && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <CheckCircle size={14} />
            Registered
          </span>
        )}
      </div>

      <div className="space-y-4" ref={ref}>
        <div className="relative">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setDropdownOpen(true)}
            placeholder="Type name to search or register..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />

          {showDropdown && (
            <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
              {searchLoading && (
                <p className="px-4 py-3 text-sm text-gray-400">Searching...</p>
              )}
              {!searchLoading && searchResults.map((customer) => {
                const plan = getActiveMonthlyPlan(customer)
                return (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() => handleSelectExisting(customer)}
                    className="flex w-full flex-col border-b border-gray-50 px-4 py-3 text-left transition last:border-0 hover:bg-primary-50"
                  >
                    <span className="font-medium text-gray-900">{customer.name}</span>
                    <span className="text-xs text-gray-500">{customer.phone}</span>
                    {customer.address && (
                      <span className="text-xs text-gray-400">{customer.address}</span>
                    )}
                    {customer.customer_type === 'monthly' && plan && (
                      <span className="mt-1 text-xs text-purple-600">
                        Monthly · Renews {formatDate(plan.end_date)}
                      </span>
                    )}
                  </button>
                )
              })}
              {!searchLoading && searchResults.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-primary-600">
                  <UserPlus size={16} />
                  New customer — fill details below to register
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Phone Number"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Delivery Address
          </label>
          <textarea
            value={form.address}
            onChange={(e) => updateForm((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="House no., street, area, landmark"
            rows={3}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Customer Type</p>
          {CUSTOMER_TYPES.map((type) => (
            <label key={type.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="customerType"
                checked={form.customerType === type.value}
                onChange={() => {
                  updateForm((prev) => ({
                    ...prev,
                    customerType: type.value,
                    startDate: '',
                    endDate: '',
                    renewDate: '',
                    planId: type.value === 'monthly' ? prev.planId : null,
                  }))
                  if (type.value === 'regular') {
                    setActivePlan(null)
                    setRenewEditOpen(false)
                  }
                }}
                className="text-primary-600"
              />
              {type.label}
            </label>
          ))}
        </div>

        {loadingPlan && (
          <p className="text-sm text-gray-400">Loading plan details...</p>
        )}

        {/* Existing monthly mess customer — show plan info + renew date only */}
        {isExistingMonthly && !loadingPlan && (
          <div className="space-y-3 rounded-lg border border-purple-100 bg-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-900">
                <Calendar size={16} />
                Monthly Mess Plan
              </div>
              {!renewEditOpen ? (
                <button
                  type="button"
                  onClick={() => setRenewEditOpen(true)}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700"
                >
                  Update
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRenewEditOpen(false)
                    updateForm((prev) => ({
                      ...prev,
                      renewDate: activePlan.end_date?.slice(0, 10) || '',
                    }))
                  }}
                  className="rounded-lg border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 transition hover:bg-purple-100"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="space-y-1 text-sm text-purple-800">
              <p>
                Status:{' '}
                <span className={`font-medium ${activePlan.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                  {activePlan.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
              <p>Started: {formatDate(activePlan.start_date)}</p>
              <p className="font-semibold">Renew Date: {formatDate(activePlan.end_date)}</p>
            </div>
            {renewEditOpen && (
              <div className="space-y-3 border-t border-purple-200 pt-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-purple-700">
                    New Renew Date
                  </label>
                  <input
                    type="date"
                    min={getTodayDateInput()}
                    value={form.renewDate}
                    onChange={(e) => updateForm((prev) => ({ ...prev, renewDate: e.target.value }))}
                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const success = await handleSave('renew')
                    if (success) setRenewEditOpen(false)
                  }}
                  disabled={
                    saving ||
                    !form.renewDate ||
                    form.renewDate === activePlan.end_date?.slice(0, 10)
                  }
                  className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Renew Date'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Existing customer switched to monthly or monthly without plan */}
        {isExistingMonthlyNoPlan && !loadingPlan && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                min={getTodayDateInput()}
                value={form.startDate}
                onChange={(e) => updateForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">End Date</label>
              <input
                type="date"
                min={form.startDate || getTodayDateInput()}
                value={form.endDate}
                onChange={(e) => updateForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* New monthly customer registration */}
        {isNewMonthly && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-gray-500">Start Date</label>
              <input
                type="date"
                min={getTodayDateInput()}
                value={form.startDate}
                onChange={(e) => updateForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">End Date</label>
              <input
                type="date"
                min={form.startDate || getTodayDateInput()}
                value={form.endDate}
                onChange={(e) => updateForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {!isExisting && (
          <button
            type="button"
            onClick={() => handleSave('register')}
            disabled={saving || !form.name || !form.phone}
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        )}

        {isExisting && (hasProfileChanges || isExistingMonthlyNoPlan) && (
          <button
            type="button"
            onClick={() => handleSave('update')}
            disabled={
              saving ||
              !form.phone ||
              (isExistingMonthlyNoPlan && (!form.startDate || !form.endDate))
            }
            className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}

      </div>
    </div>
  )
}

export { emptyForm as emptyCustomerForm }
