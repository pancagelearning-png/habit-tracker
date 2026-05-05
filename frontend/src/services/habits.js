import { api } from './api'

export const habitsService = {
  getAll:      ()                => api.get('/habits'),
  getToday:    ()                => api.get('/habits/today'),
  getByDate:   (date)            => api.get(`/habits/date/${date}`),
  getStats:    (id, days = 30)   => api.get(`/habits/${id}/stats?days=${days}`),
  // Fetches per-habit stats for every active habit and shapes the result to match
  // the old global-stats response: { stats: [...], totalDays }
  getAllStats:  async (days = 30) => {
    const habits = await api.get('/habits')
    if (!habits?.length) return { stats: [], totalDays: days }
    const results = await Promise.all(habits.map(h => api.get(`/habits/${h.id}/stats?days=${days}`)))
    const stats = results.map(r => ({
      id:          r.habit.id,
      name:        r.habit.name,
      color:       r.habit.color,
      completions: r.completions,
      rate:        r.completionRate
    }))
    return { stats, totalDays: days }
  },
  getLogs:        (id, month) => api.get(`/habit-logs/${id}${month ? `?month=${month}` : ''}`),
  getLogsByDate:  (date)      => api.get(`/habit-logs/date/${date}`),
  create:      (data)            => api.post('/habits', data),
  update:      (id, data)        => api.put(`/habits/${id}`, data),
  delete:      (id)              => api.delete(`/habits/${id}`),
  log:         (id, data)        => api.post('/habit-logs', { habit_id: id, ...(data || {}) }),
  updateLog:   (logId, data)     => api.put(`/habit-logs/${logId}`, data),
  deleteLog:   (logId)           => api.delete(`/habit-logs/${logId}`),
  archive:     (id)              => api.put(`/habits/${id}/archive`)
}
