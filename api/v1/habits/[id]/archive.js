const { setCorsHeaders, withAuth } = require('../../../_lib/adapter')
const { archiveHabit } = require('../../../../backend/controllers/habitsController')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })
  return withAuth(req, res, archiveHabit)
}
