const fp = require('fastify-plugin')
const jwt = require('@fastify/jwt')

module.exports = fp(async function (fastify) {
  fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production'
  })

  // Decorate with authenticate hook — add to any route that requires auth
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized', message: err.message })
    }
  })
})
