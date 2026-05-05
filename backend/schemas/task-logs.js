const logTaskSchema = {
  body: {
    type: 'object',
    required: ['task_id', 'status'],
    properties: {
      task_id: { type: 'string', format: 'uuid' },
      status:  { type: 'string', enum: ['completed', 'not_completed', 'missed'] }
    },
    additionalProperties: true
  }
}

module.exports = { logTaskSchema }
