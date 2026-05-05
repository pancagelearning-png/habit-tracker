require('dotenv').config()

const fastify = require('fastify')({ logger: true })

// Plugins
fastify.register(require('./plugins/cors'))
fastify.register(require('./plugins/jwt'))

// Routes
fastify.register(require('./routes'), { prefix: '/api/v1' })

// Health check
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

const start = async () => {
  try {
    await fastify.listen({
      port: parseInt(process.env.PORT) || 3000,
      host: '0.0.0.0'
    })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
