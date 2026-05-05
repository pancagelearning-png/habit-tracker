const { supabase } = require('../supabase')

async function getHabits(request, reply) {
  const { id: user_id } = request.user

  const { data, error } = await supabase
    .from('habits')
    .select('*, categories(id, name, icon, color, is_default)')
    .eq('user_id', user_id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  console.log('getHabits: total fetched:', data?.length, 'error:', error)

  if (error) return reply.code(500).send({ error: error.message })

  return data
}

async function getTodayHabits(request, reply) {
  const { id: user_id } = request.user

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('habits')
    .select('*, categories(id, name, icon, color, is_default)')
    .eq('user_id', user_id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getTodayHabits] Supabase error:', error)
    return reply.code(500).send({ error: error.message })
  }

  console.log('[getTodayHabits] requestedDate:', today)
  ;(data || []).forEach(habit => {
    console.log('[getTodayHabits] habit:', habit.name, 'start_date:', habit.start_date, 'end_date:', habit.end_date)
  })

  const requestedDate = today
  const todayDate = new Date(requestedDate)
  const todayDayOfMonth = todayDate.getDate()
  const todayDayOfWeek = todayDate.getDay() || 7

  let habits = data || []
  habits = habits.filter(habit => {
    const start = habit.start_date ? habit.start_date.split('T')[0] : null
    const end = habit.end_date ? habit.end_date.split('T')[0] : null
    if (start && start > requestedDate) return false
    if (end && end < requestedDate) return false

    if (habit.frequency === 'daily') return true

    if (habit.frequency === 'weekly') {
      const days = habit.target_days || []
      return days.includes(todayDayOfWeek)
    }

    if (habit.frequency === 'monthly') {
      const days = Array.isArray(habit.custom_days) ? habit.custom_days : []
      return days.includes(todayDayOfMonth)
    }

    if (habit.frequency === 'repeat') {
      const cd = habit.custom_days || {}
      if (!cd.every || !habit.start_date) return false
      const start = new Date(habit.start_date)
      const current = new Date(requestedDate)
      const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24))
      return diffDays % cd.every === 0
    }

    if (habit.frequency === 'period') return true

    return true
  })

  return habits
}

async function getHabitsByDate(request, reply) {
  const { id: user_id } = request.user
  const { date } = request.params

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return reply.code(400).send({ error: 'date must be in YYYY-MM-DD format' })
  }

  const { data, error } = await supabase
    .from('habits')
    .select('*, categories(id, name, icon, color, is_default)')
    .eq('user_id', user_id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getHabitsByDate] Supabase error:', error)
    return reply.code(500).send({ error: error.message })
  }

  const requestedDate = date
  console.log('[getHabitsByDate] requestedDate:', requestedDate)
  ;(data || []).forEach(habit => {
    console.log('[getHabitsByDate] habit:', habit.name, 'start_date:', habit.start_date, 'end_date:', habit.end_date)
  })

  const todayDate = new Date(requestedDate)
  const todayDayOfMonth = todayDate.getDate()
  const todayDayOfWeek = todayDate.getDay() || 7

  let habits = data || []
  habits = habits.filter(habit => {
    const start = habit.start_date ? habit.start_date.split('T')[0] : null
    const end = habit.end_date ? habit.end_date.split('T')[0] : null
    if (start && start > requestedDate) return false
    if (end && end < requestedDate) return false

    if (habit.frequency === 'daily') return true

    if (habit.frequency === 'weekly') {
      const days = habit.target_days || []
      return days.includes(todayDayOfWeek)
    }

    if (habit.frequency === 'monthly') {
      const days = Array.isArray(habit.custom_days) ? habit.custom_days : []
      return days.includes(todayDayOfMonth)
    }

    if (habit.frequency === 'repeat') {
      const cd = habit.custom_days || {}
      if (!cd.every || !habit.start_date) return false
      const start = new Date(habit.start_date)
      const current = new Date(requestedDate)
      const diffDays = Math.floor((current - start) / (1000 * 60 * 60 * 24))
      return diffDays % cd.every === 0
    }

    if (habit.frequency === 'period') return true

    return true
  })

  return habits
}

async function createHabit(request, reply) {
  const { id: user_id } = request.user
  const {
    name, description,
    category_id = null,
    category_name,
    category_icon,
    category_color,
    category_is_default = false,
    frequency = 'daily',
    target_days = [1, 2, 3, 4, 5, 6, 7],
    color = '#6C63FF',
    icon,
    habit_type,
    start_date,
    end_date,
    reminder_enabled,
    reminder_time,
    priority
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

  const insertPayload = {
    user_id, name, description, category_id: finalCategoryId, frequency, target_days, color, icon,
    habit_type, start_date, end_date, reminder_enabled, reminder_time, priority
  }

  const { data, error } = await supabase
    .from('habits')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    console.error('[createHabit] Supabase INSERT error:', {
      message: error.message,
      code: error.code,
      details: error.details
    })
    return reply.code(500).send({ error: error.message })
  }
  return reply.code(201).send(data)
}

async function updateHabit(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const {
    category_id = null,
    category_name,
    category_icon,
    category_color,
    category_is_default = false,
    ...rest
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

  const { data, error } = await supabase
    .from('habits')
    .update({ ...rest, category_id: finalCategoryId })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .maybeSingle()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Habit not found' })
  return data
}

async function deleteHabit(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  console.log('[deleteHabit] habit id:', id, 'user_id:', user_id)

  // Check the habit exists and belongs to this user before deleting
  const { data: habit, error: findError } = await supabase
    .from('habits')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .maybeSingle()

  if (findError) {
    console.error('[deleteHabit] Supabase find error:', {
      message: findError.message,
      code: findError.code,
      details: findError.details,
    })
    return reply.code(500).send({ error: findError.message })
  }
  if (!habit) return reply.code(404).send({ error: 'Habit not found' })

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

  if (error) {
    console.error('[deleteHabit] Supabase delete error:', {
      message: error.message,
      code: error.code,
      details: error.details,
    })
    return reply.code(500).send({ error: error.message })
  }

  return reply.code(200).send({ message: 'Habit deleted successfully' })
}

async function archiveHabit(request, reply) {
  const { id: user_id } = request.user
  const { id } = request.params

  const { data, error } = await supabase
    .from('habits')
    .update({ is_archived: true, is_active: false })
    .eq('id', id)
    .eq('user_id', user_id)
    .select()
    .maybeSingle()

  if (error) return reply.code(500).send({ error: error.message })
  if (!data) return reply.code(404).send({ error: 'Habit not found' })
  return data
}

async function getHabitStats(request, reply) {
  const { id: user_id } = request.user
  const { id: habit_id } = request.params
  const days = parseInt(request.query.days) || 30

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  const start = startDate.toISOString().split('T')[0]
  const end   = endDate.toISOString().split('T')[0]

  // Verify the habit belongs to this user
  const { data: habit, error: habitError } = await supabase
    .from('habits')
    .select('id, name, color, icon, frequency, target_days')
    .eq('id', habit_id)
    .eq('user_id', user_id)
    .maybeSingle()

  if (habitError) return reply.code(500).send({ error: habitError.message })
  if (!habit)     return reply.code(404).send({ error: 'Habit not found' })

  const { data: logs, error: logsError } = await supabase
    .from('habit_logs')
    .select('completed_at')
    .eq('habit_id', habit_id)
    .eq('user_id', user_id)
    .gte('completed_at', start)
    .lte('completed_at', end)
    .order('completed_at', { ascending: false })

  if (logsError) return reply.code(500).send({ error: logsError.message })

  const completedDates = new Set((logs || []).map(l => l.completed_at))
  const completions    = completedDates.size

  // Current streak: walk backwards from today
  let currentStreak = 0
  const cursor = new Date(endDate)
  while (true) {
    const dateStr = cursor.toISOString().split('T')[0]
    if (completedDates.has(dateStr)) {
      currentStreak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return {
    habit,
    period:         { days, startDate: start, endDate: end },
    completions,
    completionRate: Math.round((completions / days) * 100),
    currentStreak,
    completedDates: Array.from(completedDates).sort()
  }
}

module.exports = {
  getHabits,
  getTodayHabits,
  getHabitsByDate,
  createHabit,
  updateHabit,
  deleteHabit,
  archiveHabit,
  getHabitStats
}
