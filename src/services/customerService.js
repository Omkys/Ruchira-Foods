import { supabase } from '../lib/supabase'

export async function searchCustomers(query) {
  if (!query || query.length < 1) return []

  const { data, error } = await supabase
    .from('customers')
    .select('*, monthly_plans(*)')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('name')
    .limit(10)

  if (error) throw error
  return data
}

export function getActiveMonthlyPlan(customer) {
  if (!customer?.monthly_plans?.length) return null
  const active = customer.monthly_plans.find((p) => p.is_active)
  if (active) return active
  return [...customer.monthly_plans].sort(
    (a, b) => new Date(b.end_date) - new Date(a.end_date)
  )[0]
}

export async function fetchCustomers(search = '') {
  let query = supabase
    .from('customers')
    .select('*, monthly_plans(*)')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getCustomerById(id) {
  const { data, error } = await supabase
    .from('customers')
    .select('*, monthly_plans(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCustomer({ name, phone, address, customerType }) {
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      name,
      phone,
      address: address || null,
      customer_type: customerType || 'regular',
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCustomer(id, updates) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCustomerOrders(customerId) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), receipts(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getMonthlyCustomerCount() {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('customer_type', 'monthly')

  if (error) throw error
  return count || 0
}
