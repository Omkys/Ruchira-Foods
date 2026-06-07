import { supabase } from '../lib/supabase'

export async function fetchMonthlyPlans() {
  const { data, error } = await supabase
    .from('monthly_plans')
    .select('*, customers(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getActivePlansCount() {
  const { count, error } = await supabase
    .from('monthly_plans')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  if (error) throw error
  return count || 0
}

export async function createMonthlyPlan({ customerId, startDate, endDate }) {
  const { data, error } = await supabase
    .from('monthly_plans')
    .insert([{
      customer_id: customerId,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    }])
    .select('*, customers(*)')
    .single()

  if (error) throw error

  await supabase
    .from('customers')
    .update({ customer_type: 'monthly' })
    .eq('id', customerId)

  return data
}

export async function updateMonthlyPlan(id, updates) {
  const { data, error } = await supabase
    .from('monthly_plans')
    .update(updates)
    .eq('id', id)
    .select('*, customers(*)')
    .single()

  if (error) throw error
  return data
}

export async function renewMonthlyPlan(id, newEndDate) {
  return updateMonthlyPlan(id, { end_date: newEndDate, is_active: true })
}

export async function deactivateMonthlyPlan(id) {
  return updateMonthlyPlan(id, { is_active: false })
}
