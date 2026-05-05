import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production'

function authenticate(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized' }
  }
  const token = authHeader.slice(7)
  try {
    return { user: jwt.verify(token, JWT_SECRET) }
  } catch (err) {
    return { error: err.message }
  }
}

function createRequest(req, extraParams = {}) {
  return {
    body: req.body || {},
    query: req.query || {},
    params: { ...(req.query || {}), ...extraParams },
    headers: req.headers,
    user: null,
    log: { error: console.error },
    server: {
      jwt: {
        sign: (payload, options) => jwt.sign(payload, JWT_SECRET, options)
      }
    }
  }
}

function createReply(res) {
  let statusCode = 200
  const reply = {
    sent: false,
    code(n) { statusCode = n; return this },
    send(data) {
      reply.sent = true
      if (statusCode === 204) return res.status(204).end()
      res.status(statusCode).json(data)
    }
  }
  return reply
}

export function withAuth(ctrl, extraParams = {}) {
  return async (req, res) => {
    const authResult = authenticate(req)
    if (authResult.error) {
      return res.status(401).json({ error: 'Unauthorized', message: authResult.error })
    }
    const request = createRequest(req, extraParams)
    request.user = authResult.user
    const reply = createReply(res)
    const result = await ctrl(request, reply)
    if (!reply.sent && result !== undefined) reply.send(result)
  }
}

export function withoutAuth(ctrl) {
  return async (req, res) => {
    const request = createRequest(req)
    const reply = createReply(res)
    const result = await ctrl(request, reply)
    if (!reply.sent && result !== undefined) reply.send(result)
  }
}
