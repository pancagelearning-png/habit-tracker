module.exports = async function routes(fastify) {
  fastify.register(require('./auth'),       { prefix: '/auth' })
  fastify.register(require('./habits'),     { prefix: '/habits' })
  fastify.register(require('./habit-logs'), { prefix: '/habit-logs' })
  fastify.register(require('./tasks'),      { prefix: '/tasks' })
  fastify.register(require('./task-logs'),  { prefix: '/task-logs' })
  fastify.register(require('./categories'), { prefix: '/categories' })
}
