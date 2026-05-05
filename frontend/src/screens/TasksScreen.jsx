import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { tasksService } from '../services/tasks'
import HamburgerMenu from '../components/HamburgerMenu'

const ACCENT  = '#E8445A'
const BG      = '#0A0A0A'
const CARD    = '#1A1A1A'
const TEXT    = '#FFFFFF'
const TEXT2   = '#888888'
const BORDER  = '#2A2A2A'

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' }

const ICON_COLORS = [
  '#6C63FF','#EC4899','#F59E0B','#22C55E','#06B6D4','#EF4444','#8B5CF6','#F97316',
]

function pickColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length]
}

function toISODate(d) {
  return d.toISOString().split('T')[0]
}

function formatDateHeader(iso) {
  const today    = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const todayStr    = toISODate(today)
  const tomorrowStr = toISODate(tomorrow)
  if (iso === todayStr)    return 'Today'
  if (iso === tomorrowStr) return 'Tomorrow'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function groupByDate(tasks) {
  const map = new Map()
  tasks.forEach(task => {
    const key = task.due_date || '__no_date__'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(task)
  })
  const groups = []
  for (const [key, items] of map) {
    groups.push({ key, label: key === '__no_date__' ? 'No Date' : formatDateHeader(key), tasks: items })
  }
  return groups
}

// ── SVG Icons ─────────────────────────────────────────────────
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function IconFilter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}

// ── Task Card (no toggle, full-card tap to edit) ───────────────
function TaskCard({ task, isRecurring, onClick }) {
  const { name = '', priority, due_date, frequency, categories, color } = task
  const iconColor = color || pickColor(name)
  const prioColor = PRIORITY_COLOR[priority] || '#888'

  const freqLabel = frequency === 'daily'   ? 'Every day'
    : frequency === 'weekly'  ? 'Every week'
    : frequency === 'monthly' ? 'Every month'
    : frequency ? `Every ${frequency}` : null

  const dueDateLabel = due_date
    ? 'Due ' + new Date(due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'No due date'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px',
        background: CARD,
        borderRadius: 16,
        marginBottom: 10,
        width: '100%',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Colored icon square */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: '#fff', fontWeight: 700, fontSize: 18,
      }}>
        {name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 700, color: TEXT,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>
          {name}
        </p>

        <p style={{ fontSize: 11, color: TEXT2, marginBottom: 5 }}>
          {isRecurring ? (freqLabel || 'No frequency') : dueDateLabel}
        </p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {priority && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#fff',
              background: prioColor, borderRadius: 20, padding: '2px 8px',
              textTransform: 'capitalize',
            }}>
              {priority}
            </span>
          )}
          {categories?.name && (
            <span style={{
              fontSize: 10, fontWeight: 500, color: '#fff',
              background: categories.color || TEXT2, borderRadius: 20, padding: '2px 8px',
            }}>
              {categories.name}
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </button>
  )
}

// ── Date Group Header ─────────────────────────────────────────
function DateHeader({ label }) {
  return (
    <p style={{
      fontSize: 12, fontWeight: 700, color: TEXT2,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: 10, marginTop: 20,
    }}>
      {label}
    </p>
  )
}

// ── Empty State ───────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flex: 1, paddingTop: 80,
    }}>
      <span style={{ fontSize: 56, marginBottom: 16 }}>📋</span>
      <p style={{ fontWeight: 700, fontSize: 17, color: TEXT, marginBottom: 6 }}>No tasks</p>
      <p style={{ fontSize: 13, color: TEXT2 }}>There are no upcoming tasks</p>
    </div>
  )
}

// ── Bottom Sheet ──────────────────────────────────────────────
const SHEET_OPTIONS = [
  { icon: '🔄', label: 'Add Habit',          sub: 'Track a recurring habit'  },
  { icon: '✅', label: 'Add Single Task',     sub: 'Add a one-time task'      },
  { icon: '🔁', label: 'Add Recurring Task',  sub: 'Create a repeating task'  },
]

function BottomSheet({ onClose, onAddHabit, onAddSingleTask, onAddRecurringTask }) {
  const handlers = [onAddHabit, onAddSingleTask, onAddRecurringTask]
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 200 }}
      />
      <div style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 390,
        background: '#1A1A1A', borderRadius: '20px 20px 0 0',
        padding: '16px 20px 44px', zIndex: 201,
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#444', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Create New</p>
        {SHEET_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={handlers[i]}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '16px',
              background: '#252525', borderRadius: 14, marginBottom: 10,
              textAlign: 'left', border: 'none', cursor: 'pointer',
            }}
          >
            <span style={{
              width: 42, height: 42, borderRadius: 11,
              background: ACCENT + '22',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
            }}>{opt.icon}</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{opt.label}</p>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{opt.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

// ── Main Screen ───────────────────────────────────────────────
export default function TasksScreen() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [activeTab,  setActiveTab]  = useState('single')
  const [tasks,      setTasks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showSheet,  setShowSheet]  = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const data   = await tasksService.getAll({ type: activeTab })
      const list   = Array.isArray(data) ? data : (data?.tasks ?? data?.data ?? [])
      const sorted = activeTab === 'single'
        ? [...list].sort((a, b) => {
            if (!a.due_date) return 1
            if (!b.due_date) return -1
            return a.due_date.localeCompare(b.due_date)
          })
        : list
      setTasks(sorted)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { fetchTasks() }, [fetchTasks, location.key])

  function handleCardClick(task) {
    navigate('/add', { state: { tab: 'task', taskType: task.task_type || 'single', task } })
  }

  function handleAddHabit() {
    setShowSheet(false)
    navigate('/add', { state: { tab: 'habit' } })
  }

  function handleAddSingleTask() {
    setShowSheet(false)
    navigate('/add', { state: { tab: 'task', taskType: 'single' } })
  }

  function handleAddRecurringTask() {
    setShowSheet(false)
    navigate('/add', { state: { tab: 'task', taskType: 'recurring' } })
  }

  const TABS = [
    { key: 'single',    label: 'Single tasks' },
    { key: 'recurring', label: 'Recurring tasks' },
  ]

  const groups = groupByDate(tasks)

  return (
    <div style={{
      background: BG, minHeight: '100vh', maxWidth: 390,
      margin: '0 auto', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '56px 20px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => setShowMenu(true)}>
            <IconMenu />
          </button>
          <span style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>Tasks</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <IconSearch />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <IconFilter />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <IconDownload />
          </button>
        </div>
      </div>
      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${BORDER}`,
        marginBottom: 4, paddingLeft: 4,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '12px 4px',
                background: 'none', border: 'none',
                borderBottom: active ? `2px solid ${ACCENT}` : '2px solid transparent',
                color: active ? TEXT : TEXT2,
                fontWeight: active ? 700 : 400,
                fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s', marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 16px', paddingBottom: 100 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: `3px solid ${BORDER}`, borderTopColor: ACCENT,
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState />
        ) : activeTab === 'single' ? (
          groups.map(group => (
            <div key={group.key}>
              <DateHeader label={group.label} />
              {group.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isRecurring={false}
                  onClick={() => handleCardClick(task)}
                />
              ))}
            </div>
          ))
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isRecurring={true}
              onClick={() => handleCardClick(task)}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowSheet(true)}
        style={{
          position: 'fixed', bottom: 88,
          right: 'calc(50% - 175px)',
          width: 56, height: 56, borderRadius: '50%',
          background: ACCENT,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 20px ${ACCENT}66`,
          zIndex: 90, border: 'none', cursor: 'pointer',
        }}
      >
        <IconPlus />
      </button>

      {showSheet && (
        <BottomSheet
          onClose={() => setShowSheet(false)}
          onAddHabit={handleAddHabit}
          onAddSingleTask={handleAddSingleTask}
          onAddRecurringTask={handleAddRecurringTask}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
