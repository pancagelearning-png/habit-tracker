const { setCorsHeaders, withAuth } = require('../../_lib/adapter')
const ctrl = require('../../../backend/controllers/categoriesController')

module.exports = async function handler(req, res) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method === 'PUT')    return withAuth(req, res, ctrl.updateCategory)
  if (req.method === 'DELETE') return withAuth(req, res, ctrl.deleteCategory)
  res.status(405).json({ error: 'Method not allowed' })
}
