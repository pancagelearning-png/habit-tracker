import { getPriorityColor } from '../utils/helpers'

export default function TaskCard({ task, onToggle, onDelete }) {
  const { title, priority, is_completed, due_date, categories } = task
  const priorityColor = getPriorityColor(priority)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      background: '#1A1A1A',
      borderRadius: 16,
      marginBottom: 10,
      border: `1px solid ${is_completed ? '#2A2A2A' : '#2A2A2A'}`,
      opacity: is_completed ? 0.6 : 1,
      transition: 'opacity 0.2s'
    }}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          border: `2px solid ${is_completed ? '#444' : priorityColor}`,
          background: is_completed ? '#333' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s',
          padding: 0
        }}
      >
        {is_completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="#888" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14,
          fontWeight: 500,
          color: is_completed ? '#555' : '#fff',
          textDecoration: is_completed ? 'line-through' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {title}
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          {due_date && (
            <span style={{ fontSize: 11, color: '#666' }}>
              {new Date(due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {categories?.name && (
            <span style={{ fontSize: 11, color: categories.color || '#888' }}>
              {categories.name}
            </span>
          )}
        </div>
      </div>

      {/* Priority dot */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: priorityColor,
        flexShrink: 0,
        opacity: 0.8
      }} />
    </div>
  )
}
