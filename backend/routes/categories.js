const ctrl = require('../controllers/categoriesController')
const { createCategorySchema, updateCategorySchema } = require('../schemas/categories')

module.exports = async function categoriesRoutes(fastify) {
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.get('/',       ctrl.getCategories)
  fastify.post('/',      { schema: createCategorySchema }, ctrl.createCategory)
  fastify.put('/:id',    { schema: updateCategorySchema }, ctrl.updateCategory)
  fastify.delete('/:id', ctrl.deleteCategory)
}
