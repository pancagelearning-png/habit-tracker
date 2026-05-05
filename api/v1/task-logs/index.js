const { setCorsHeaders, withAuth } = require('../../_lib/adapter')
const { logTask } = require('../../../backend/controllers/taskLogsController')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  return withAuth(req, res, logTask)
}
