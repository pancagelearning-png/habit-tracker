const ctrl = require('../controllers/habitsController')
const { createHabitSchema, updateHabitSchema } = require('../schemas/habits')

module.exports = async function habitsRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.get('/',            ctrl.getHabits)
  fastify.get('/today',       ctrl.getTodayHabits)
  fastify.get('/date/:date',  ctrl.getHabitsByDate)
  fastify.post('/',           { schema: createHabitSchema }, ctrl.createHabit)
  fastify.put('/:id',         { schema: updateHabitSchema }, ctrl.updateHabit)
  fastify.delete('/:id',      ctrl.deleteHabit)
  fastify.put('/:id/archive', ctrl.archiveHabit)
  fastify.get('/:id/stats',   ctrl.getHabitStats)
}
