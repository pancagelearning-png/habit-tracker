const createHabitSchema = {
  body: {
    type: 'object',
    additionalProperties: true,
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      frequency: { type: 'string' },
      color: { type: 'string' },
      habit_type: { type: 'string' },
      start_date: { type: 'string' },
      end_date: { type: 'string' },
      priority: { type: 'string' },
      reminder_enabled: { type: 'boolean' },
      reminder_time: { type: 'string' },
      category_id: { type: 'string' },
      category_name: { type: 'string' },
      category_icon: { type: 'string' },
      category_color: { type: 'string' }
    }
  }
}

const updateHabitSchema = {
  body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string', maxLength: 1000 },
      category_id: { type: ['string', 'null'] },
      category_name: { type: ['string', 'null'] },
      category_icon: { type: ['string', 'null'] },
      category_color: { type: ['string', 'null'] },
      frequency: {
        type: 'string',
        enum: ['daily', 'weekly', 'monthly', 'period', 'repeat', 'custom']
      },
      target_days: { type: 'array', items: { type: 'integer', minimum: 1, maximum: 7 } },
      color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
      icon: { type: ['string', 'null'] },
      is_active: { type: 'boolean' }
    },
    additionalProperties: true
  }
}

const logHabitSchema = {
  body: {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      note: { type: 'string', maxLength: 500 }
    },
    additionalProperties: false
  }
}

module.exports = { createHabitSchema, updateHabitSchema, logHabitSchema }
