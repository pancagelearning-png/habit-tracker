const ctrl = require('../controllers/habitLogsController')
const { logHabitSchema } = require('../schemas/habit-logs')

module.exports = async function habitLogsRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  // POST /api/v1/habit-logs — log a habit completion
  fastify.post('/', { schema: logHabitSchema }, ctrl.createHabitLog)

  // GET /api/v1/habit-logs/date/:date — all habit logs for a specific date
  // Registered before /:habitId so the static 'date' segment takes priority
  fastify.get('/date/:date', ctrl.getLogsByDate)

  // GET /api/v1/habit-logs/:habitId — all logs for a specific habit
  fastify.get('/:habitId', ctrl.getLogsByHabit)

  // PUT /api/v1/habit-logs/:id — update an existing log
  fastify.put('/:id', ctrl.updateHabitLog)

  // DELETE /api/v1/habit-logs/:id — delete an existing log
  fastify.delete('/:id', ctrl.deleteHabitLog)
}
