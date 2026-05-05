const { setCorsHeaders, withoutAuth } = require('../../_lib/adapter')
const { login } = require('../../../backend/controllers/authController')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  return withoutAuth(req, res, login)
}
