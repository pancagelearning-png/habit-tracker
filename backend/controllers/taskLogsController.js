const { supabase } = require('../supabase')

// POST /api/v1/task-logs
// Body: { task_id, status }
// Creates a task log entry and syncs is_completed on the parent task.
async function logTask(request, reply) {
  const { id: user_id } = request.user

  console.log('[logTask] Full request body received:', request.body)

  const { task_id, status, log_date } = request.body
  const resolvedDate = log_date || new Date().toISOString().split('T')[0]

  console.log('[logTask] Parsed fields — task_id:', task_id, '| status:', status, '| log_date:', resolvedDate)

  // Verify the task belongs to this user
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', task_id)
    .eq('user_id', user_id)
    .maybeSingle()

  if (!task) return reply.code(404).send({ error: 'Task not found' })

  const insertPayload = { task_id, user_id, log_date: resolvedDate, status }
  console.log('[logTask] Supabase insert payload:', insertPayload)

  const { data, error } = await supabase
    .from('task_logs')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('[logTask] Supabase insert error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return reply.code(500).send({ error: error.message })
  }

  // Keep is_completed on the task in sync with status
  if (status === 'completed') {
    await supabase.from('tasks').update({ is_completed: true }).eq('id', task_id)
  } else if (status === 'not_completed' || status === 'missed') {
    await supabase.from('tasks').update({ is_completed: false }).eq('id', task_id)
  }

  return reply.code(201).send(data)
}

// GET /api/v1/task-logs/:taskId
// Returns all log entries for a specific task (must belong to the authenticated user).
async function getLogsByTask(request, reply) {
  const { id: user_id } = request.user
  const { taskId }       = request.params

  const { data, error } = await supabase
    .from('task_logs')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) return reply.code(500).send({ error: error.message })
  return data
}

// GET /api/v1/task-logs/date/:date
// Returns all task log entries created on a specific calendar day (YYYY-MM-DD),
// joined with basic task info.
async function getLogsByDate(request, reply) {
  const { id: userId } = request.user
  const { date }       = request.params

  console.log('getTaskLogsByDate called with date:', date)
  console.log('user_id:', userId)
  const { data, error } = await supabase
    .from('task_logs')
    .select('id, task_id, status, log_date')
    .eq('user_id', userId)
    .gte('log_date', date + 'T00:00:00.000Z')
    .lte('log_date', date + 'T23:59:59.999Z')
  console.log('task logs found:', data)
  console.log('error:', error)

  if (error) return reply.code(500).send({ error: error.message })
  return data
}

// PUT /api/v1/task-logs/:id
// Body: { status }
// Updates the status of a task log entry belonging to the authenticated user.
async function updateTaskLog(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params
  const { status } = request.body

  const { data, error } = await supabase
    .from('task_logs')
    .update({ status })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .maybeSingle()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Task log not found' })
  return data
}

// DELETE /api/v1/task-logs/:id
// Deletes a task log entry belonging to the authenticated user.
async function deleteTaskLog(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { error } = await supabase
    .from('task_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

  if (error) return reply.code(500).send({ error: error.message })
  return reply.code(204).send()
}

module.exports = { logTask, getLogsByTask, getLogsByDate, updateTaskLog, deleteTaskLog }
