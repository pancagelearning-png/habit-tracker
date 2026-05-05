const { supabase } = require('../supabase')

// POST /api/v1/habit-logs
// Body: { habit_id, log_date?, note?, status? }
// Upserts the log: updates status if a log exists for that date, otherwise inserts.
async function createHabitLog(request, reply) {
  const { id: user_id } = request.user
  const {
    habit_id,
    log_date = new Date().toISOString().split('T')[0],
    note,
    status = 'completed'
  } = request.body

  // Verify the habit belongs to this user
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habit_id)
    .eq('user_id', user_id)
    .maybeSingle()

  if (!habit) return reply.code(404).send({ error: 'Habit not found' })

  // Check for an existing log on this date
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habit_id)
    .eq('user_id', user_id)
    .eq('log_date', log_date)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('habit_logs')
      .update({ status, note })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return reply.code(500).send({ error: error.message })
    return data
  }

  const payload = { habit_id, user_id, log_date, note, status }
  console.log('[habitLogs] inserting payload:', JSON.stringify(payload))

  const { data, error } = await supabase
    .from('habit_logs')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('[habitLogs] insert failed:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    return reply.code(500).send({ error: error.message })
  }
  return reply.code(201).send(data)
}

// GET /api/v1/habit-logs/:habitId
// Query: ?month=YYYY-MM (optional — filters to that calendar month)
async function getLogsByHabit(request, reply) {
  const { id: user_id } = request.user
  const { habitId }      = request.params
  const { month }        = request.query

  let query = supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('user_id', user_id)
    .order('completed_at', { ascending: false })

  if (month) {
    const [year, m] = month.split('-')
    const firstDay  = `${year}-${m.padStart(2, '0')}-01`
    const lastDay   = new Date(parseInt(year), parseInt(m), 0).toISOString().split('T')[0]
    query = query.gte('completed_at', firstDay).lte('completed_at', lastDay)
  }

  const { data, error } = await query
  if (error) return reply.code(500).send({ error: error.message })
  return data
}

// GET /api/v1/habit-logs/date/:date
// Returns all habit logs for the authenticated user on a given date (YYYY-MM-DD),
// joined with basic habit info.
async function getLogsByDate(request, reply) {
  const { id: userId } = request.user
  const { date }       = request.params

  console.log('getHabitLogsByDate called with date:', date)
  console.log('user_id:', userId)
  const { data, error } = await supabase
    .from('habit_logs')
    .select('id, habit_id, status, log_date')
    .eq('user_id', userId)
    .eq('log_date', date)
  console.log('habit logs found:', data)
  console.log('error:', error)

  if (error) return reply.code(500).send({ error: error.message })
  return data
}

// PUT /api/v1/habit-logs/:id
// Body: { status }
// Updates the log record owned by the authenticated user.
async function updateHabitLog(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params
  const {
    status,
    log_date = new Date().toISOString().split('T')[0],
  } = request.body

  const { data, error } = await supabase
    .from('habit_logs')
    .update({ status, log_date })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .maybeSingle()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Habit log not found' })
  return data
}

// DELETE /api/v1/habit-logs/:id
// Deletes the log record owned by the authenticated user.
async function deleteHabitLog(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { error } = await supabase
    .from('habit_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

  if (error) return reply.code(500).send({ error: error.message })
  return reply.code(204).send()
}

module.exports = { createHabitLog, getLogsByHabit, getLogsByDate, updateHabitLog, deleteHabitLog }
