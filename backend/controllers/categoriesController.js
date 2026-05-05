const { supabase } = require('../supabase')

async function getCategories(request, reply) {
  const { id: user_id } = request.user

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true })

  if (error) return reply.code(500).send({ error: error.message })

  const categoryIds = data.map(c => c.id)

  const [habitsResult, tasksResult] = await Promise.all([
    supabase
      .from('habits')
      .select('category_id')
      .eq('user_id', user_id)
      .in('category_id', categoryIds),
    supabase
      .from('tasks')
      .select('category_id')
      .eq('user_id', user_id)
      .in('category_id', categoryIds)
  ])

  if (habitsResult.error) return reply.code(500).send({ error: habitsResult.error.message })
  if (tasksResult.error) return reply.code(500).send({ error: tasksResult.error.message })

  const countMap = {}
  for (const id of categoryIds) countMap[id] = 0
  for (const h of habitsResult.data) countMap[h.category_id] = (countMap[h.category_id] || 0) + 1
  for (const t of tasksResult.data) countMap[t.category_id] = (countMap[t.category_id] || 0) + 1

  return data.map(c => ({ ...c, entry_count: countMap[c.id] ?? 0 }))
}

async function createCategory(request, reply) {
  const { id: user_id } = request.user
  const { name, color = '#6C63FF', icon, is_default = false } = request.body

  const { data, error } = await supabase
    .from('categories')
    .insert({ user_id, name, color, icon, is_default })
    .select()
    .single()

  if (error) return reply.code(500).send({ error: error.message })
  return reply.code(201).send(data)
}

async function updateCategory(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params
  const { name, icon, color } = request.body

  const updates = {}
  if (name !== undefined) updates.name = name
  if (icon !== undefined) updates.icon = icon
  if (color !== undefined) updates.color = color

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .single()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Category not found' })
  return data
}

async function deleteCategory(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

  if (error) return reply.code(500).send({ error: error.message })
  return reply.code(204).send()
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory }
