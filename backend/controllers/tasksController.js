const { supabase } = require('../supabase')

async function getTasks(request, reply) {
  try {
    const { id: user_id } = request.user
    const { completed, date } = request.query

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return reply.code(400).send({ error: 'date must be in YYYY-MM-DD format' })
    }

    let query = supabase
      .from('tasks')
      .select('*, categories(id, name, color, icon)')
      .eq('user_id', user_id)
      .eq('is_archived', false)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (completed !== undefined) {
      query = query.eq('is_completed', completed === 'true')
    }

    if (date) {
      const todayStr = new Date().toISOString().slice(0, 10)
      if (date === todayStr) {
        console.log(`[getTasks] Date filter: today (${date}) — including pending overdue tasks`)
        query = query.or(`and(due_date.gte.${date}T00:00:00,due_date.lte.${date}T23:59:59),and(is_pending.eq.true,due_date.lte.${date}T23:59:59)`)
      } else {
        console.log(`[getTasks] Date filter: ${date}`)
        query = query.filter('due_date', 'gte', date + 'T00:00:00').filter('due_date', 'lte', date + 'T23:59:59')
      }
    }

    const { data, error } = await query
    if (error) {
      console.error('[getTasks] Supabase error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return reply.code(500).send({ error: error.message })
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    console.log(`[getTasks] Requested date: ${date || 'none'} | Total tasks fetched: ${data.length} | today: ${todayStr}`)
    data.forEach(task => {
      console.log(`[getTasks] Task: "${task.name}" | due_date: ${task.due_date}`)
    })

    return data
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'Internal server error' })
  }
}

async function createTask(request, reply) {
  const { id: user_id } = request.user
  const {
    name, description,
    category_id = null,
    category_name,
    category_icon,
    category_color,
    category_is_default = false,
    due_date,
    priority = 'medium'
  } = request.body

  let finalCategoryId = category_id

  if (!category_id && category_name) {
    const { data: existingCat } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user_id)
      .eq('name', category_name)
      .maybeSingle()

    if (existingCat) {
      finalCategoryId = existingCat.id
    } else {
      const { data: newCat } = await supabase
        .from('categories')
        .insert({ user_id, name: category_name, icon: category_icon || null, color: category_color || null, is_default: category_is_default })
        .select('id')
        .single()
      if (newCat) finalCategoryId = newCat.id
    }
  }

  const payload = { user_id, name, description, category_id: finalCategoryId, due_date, priority }

  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('[createTask] Supabase error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return reply.code(500).send({ error: error.message })
  }
  return reply.code(201).send(data)
}

async function updateTask(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { data, error } = await supabase
    .from('tasks')
    .update(request.body)
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .maybeSingle()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Task not found' })
  return data
}

async function deleteTask(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

  if (error) return reply.code(500).send({ error: error.message })
  return reply.code(204).send()
}

async function archiveTask(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { data, error } = await supabase
    .from('tasks')
    .update({ is_archived: true })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .maybeSingle()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Task not found' })
  return data
}

module.exports = { getTasks, createTask, updateTask, deleteTask, archiveTask }
