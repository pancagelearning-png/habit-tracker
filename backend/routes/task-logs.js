const ctrl = require('../controllers/taskLogsController')
const { logTaskSchema } = require('../schemas/task-logs')

module.exports = async function taskLogsRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  // POST /api/v1/task-logs — log a task action
  fastify.post('/', { schema: logTaskSchema }, ctrl.logTask)

  // GET /api/v1/task-logs/date/:date — all task logs for a specific date
  // Registered before /:taskId so the static 'date' segment takes priority
  fastify.get('/date/:date', ctrl.getLogsByDate)

  // GET /api/v1/task-logs/:taskId — all logs for a specific task
  fastify.get('/:taskId', ctrl.getLogsByTask)

  // PUT /api/v1/task-logs/:id — update status of a task log
  fastify.put('/:id', ctrl.updateTaskLog)

  // DELETE /api/v1/task-logs/:id — delete a task log
  fastify.delete('/:id', ctrl.deleteTaskLog)
}
