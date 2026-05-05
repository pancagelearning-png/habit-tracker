const { setCorsHeaders, withAuth } = require('../../_lib/adapter')
const ctrl = require('../../../backend/controllers/habitLogsController')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  // GET uses habitId param name; PUT/DELETE use id — both map to req.query.id
  if (req.method === 'GET')    return withAuth(req, res, ctrl.getLogsByHabit, { habitId: req.query.id })
  if (req.method === 'PUT')    return withAuth(req, res, ctrl.updateHabitLog)
  if (req.method === 'DELETE') return withAuth(req, res, ctrl.deleteHabitLog)
  res.status(405).json({ error: 'Method not allowed' })
}
