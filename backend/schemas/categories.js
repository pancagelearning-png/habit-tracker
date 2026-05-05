const createCategorySchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', default: '#6C63FF' },
      icon: { type: 'string', maxLength: 50 }
    },
    additionalProperties: true
  }
}

const updateCategorySchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 100 },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      icon: { type: 'string', maxLength: 50 }
    },
    additionalProperties: true
  }
}

module.exports = { createCategorySchema, updateCategorySchema }
