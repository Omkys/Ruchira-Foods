import { supabase } from '../lib/supabase'

export async function fetchMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')
    .order('name')

  if (error) throw error
  return data
}

export async function createMenuItem(item) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([item])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMenuItem(id, updates) {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMenuItem(id) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}
