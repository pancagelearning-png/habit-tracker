const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_production'

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
}

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

// Wraps a controller fn with JWT auth. extraParams merges into request.params
// (use when path param name in controller differs from the [bracket] filename).
async function withAuth(req, res, ctrl, extraParams = {}) {
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

// Wraps a controller fn without auth (signup, login).
async function withoutAuth(req, res, ctrl) {
  const request = createRequest(req)
  const reply = createReply(res)
  const result = await ctrl(request, reply)
  if (!reply.sent && result !== undefined) reply.send(result)
}

module.exports = { setCorsHeaders, withAuth, withoutAuth }
