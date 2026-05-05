import { api } from './api'

export const tasksService = {
  getAll:          (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/tasks${qs ? `?${qs}` : ''}`)
  },
  create:          (data)        => api.post('/tasks', data),
  update:          (id, data)    => api.put(`/tasks/${id}`, data),
  delete:          (id)          => api.delete(`/tasks/${id}`),
  getLogsByDate:   (date)        => api.get(`/task-logs/date/${date}`),
  createLog:       (taskId, status, logDate) => api.post('/task-logs', { task_id: taskId, status, log_date: logDate }),
  updateLog:       (logId, data) => api.put(`/task-logs/${logId}`, data),
  deleteLog:       (logId)       => api.delete(`/task-logs/${logId}`),
}
