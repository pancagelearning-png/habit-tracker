const { signup, login, logout, getMe, changePassword } = require('../controllers/authController')
const { signupSchema, loginSchema } = require('../schemas/auth')

module.exports = async function authRoutes(fastify) {
  fastify.post('/signup', { schema: signupSchema }, signup)
  fastify.post('/login',  { schema: loginSchema },  login)
  fastify.post('/logout', { onRequest: [fastify.authenticate] }, logout)
  fastify.get('/me',      { onRequest: [fastify.authenticate] }, getMe)
  fastify.put('/change-password', { onRequest: [fastify.authenticate] }, changePassword)
}
