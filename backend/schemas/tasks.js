const createTaskSchema = {
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 1000 },
      category_id: { type: ['string', 'null'] },
      category_name: { type: 'string', nullable: true },
      category_icon: { type: 'string', nullable: true },
      category_color: { type: 'string', nullable: true },
      due_date: { type: 'string', format: 'date' },
      priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' }
    },
    additionalProperties: true
  }
}

const updateTaskSchema = {
  body: {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 1000 },
      category_id: { type: ['string', 'null'] },
      due_date: { type: ['string', 'null'] },
      priority: { type: 'string', enum: ['low', 'medium', 'high'] },
      is_completed: { type: 'boolean' }
    },
    additionalProperties: true
  }
}

module.exports = { createTaskSchema, updateTaskSchema }
