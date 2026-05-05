const { supabase } = require('../supabase')

async function signup(request, reply) {
  const { name, email, password } = request.body

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) {
    request.log.error(error)
    const status = error.status === 400 ? 409 : 500
    return reply.code(status).send({ error: error.message })
  }

  const user = data.user
  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, name: user.user_metadata?.name },
    { expiresIn: '30d' }
  )

  return reply.code(201).send({
    token,
    user: { id: user.id, email: user.email, name: user.user_metadata?.name, created_at: user.created_at },
  })
}

async function login(request, reply) {
  const { email, password } = request.body

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    request.log.error({ supabaseError: error }, 'Supabase signInWithPassword failed')
    console.error('Full Supabase auth error:', JSON.stringify(error, null, 2))
    const status = error.status === 400 ? 401 : (error.status || 500)
    return reply.code(status).send({ error: error.message })
  }

  const user = data.user
  const token = request.server.jwt.sign(
    { id: user.id, email: user.email, name: user.user_metadata?.name },
    { expiresIn: '30d' }
  )

  return {
    token,
    user: { id: user.id, email: user.email, name: user.user_metadata?.name, created_at: user.created_at },
  }
}

async function getMe(request, reply) {
  const { id } = request.user

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('id', id)
    .single()

  if (error || !user) {
    return reply.code(404).send({ error: 'User not found' })
  }

  return user
}

async function logout(request, reply) {
  // JWTs are stateless — the client must discard the token.
  // For true server-side revocation, add a token blocklist (e.g. Redis).
  return reply.send({ message: 'Logged out successfully' })
}

async function changePassword(request, reply) {
  const { newPassword } = request.body
  const { id: userId } = request.user

  if (!newPassword || newPassword.length < 6) {
    return reply.code(400).send({ error: 'Password must be at least 6 characters' })
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  })

  if (error) return reply.code(400).send({ error: error.message })
  return reply.send({ message: 'Password updated successfully' })
}

module.exports = { signup, login, logout, getMe, changePassword }
