const { setCorsHeaders, withAuth } = require('../../_lib/adapter')
const ctrl = require('../../../backend/controllers/habitsController')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method === 'GET')  return withAuth(req, res, ctrl.getHabits)
  if (req.method === 'POST') return withAuth(req, res, ctrl.createHabit)
  res.status(405).json({ error: 'Method not allowed' })
}
