export default function HabitCard({ habit, onToggle, showDate }) {
  const { name, color = '#6C63FF', completed, categories, description } = habit

  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px',
        background: '#1A1A1A',
        borderRadius: 18,
        marginBottom: 10,
        border: `1px solid ${completed ? color + '40' : '#2A2A2A'}`,
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.15s',
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Circle checkbox */}
      <div style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: `2px solid ${completed ? color : '#444'}`,
        background: completed ? color : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s'
      }}>
        {completed && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 15,
          fontWeight: 500,
          color: completed ? '#555' : '#fff',
          textDecoration: completed ? 'line-through' : 'none',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {name}
        </p>
        {categories?.name && (
          <p style={{ fontSize: 12, color: categories.color || '#888', marginTop: 2 }}>
            {categories.name}
          </p>
        )}
      </div>

      {/* Color pip */}
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
        opacity: completed ? 0.4 : 1
      }} />
    </div>
  )
}
