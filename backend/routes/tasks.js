const ctrl = require('../controllers/tasksController')
const { createTaskSchema, updateTaskSchema } = require('../schemas/tasks')

module.exports = async function tasksRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.get('/',            ctrl.getTasks)
  fastify.post('/',           { schema: createTaskSchema }, ctrl.createTask)
  fastify.put('/:id',         { schema: updateTaskSchema }, ctrl.updateTask)
  fastify.delete('/:id',      ctrl.deleteTask)
  fastify.put('/:id/archive', ctrl.archiveTask)
}
