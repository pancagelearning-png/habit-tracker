const logHabitSchema = {
  body: {
    type: 'object',
    required: ['habit_id'],
    properties: {
      habit_id: { type: 'string', format: 'uuid' },
      log_date: { type: 'string', format: 'date' },
      note:     { type: 'string', maxLength: 500 },
      status:   { type: 'string', enum: ['completed', 'not_completed', 'missed'] }
    },
    additionalProperties: true
  }
}

module.exports = { logHabitSchema }
