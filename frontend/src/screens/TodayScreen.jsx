import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { habitsService } from '../services/habits'
import { tasksService }  from '../services/tasks'
import { toISODate }     from '../utils/helpers'
import HamburgerMenu from '../components/HamburgerMenu'

// ── Constants ────────────────────────────────────────────────
const ACCENT  = '#E8445A'
const BG      = '#0A0A0A'
const CARD    = '#1A1A1A'
const TEXT    = '#FFFFFF'
const TEXT2   = '#888888'
const SUCCESS = '#4CAF50'
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Priority helpers ──────────────────────────────────────────
const priorityOrder = { high: 0, medium: 1, low: 2, undefined: 3, null: 3 }

const sortItems = (items, statusMap) => {
  const active = items
    .filter(i => {
      const status = statusMap[i.id]?.status
      return !status || status === 'not_completed'
    })
    .sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
      if (pDiff !== 0) return pDiff
      return new Date(a.created_at) - new Date(b.created_at)
    })
  const bottom = items.filter(i => {
    const status = statusMap[i.id]?.status
    return status === 'completed' || status === 'missed'
  })
  return [...active, ...bottom]
}

// ── Date helpers ─────────────────────────────────────────────
function dateToISO(d) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dy}`
}

function generateDateStrip(centerISO, count = 14) {
  const [y, m, day] = centerISO.split('-').map(Number)
  const center = new Date(y, m - 1, day)
  const half   = Math.floor(count / 2)
  const dates  = []
  for (let i = -half; i < count - half; i++) {
    const d = new Date(center)
    d.setDate(center.getDate() + i)
    dates.push(d)
  }
  return dates
}

// ── SVG Icons ────────────────────────────────────────────────
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function IconFilter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}

function IconCal() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function IconHelp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}

// ── Priority Pill ─────────────────────────────────────────────
function PriorityPill({ priority }) {
  if (!priority || priority === 'none') return null
  const color = priority === 'high' ? '#E8445A' : priority === 'medium' ? '#FF9500' : '#888888'
  const label = priority.charAt(0).toUpperCase() + priority.slice(1)
  return (
    <span style={{
      marginLeft: 6,
      fontSize: 10,
      fontWeight: 600,
      color,
      background: color + '33',
      borderRadius: 4,
      padding: '2px 6px',
      flexShrink: 0,
      lineHeight: 1.4,
    }}>
      {label}
    </span>
  )
}

// ── Header ───────────────────────────────────────────────────
function Header({ onMenuOpen }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '52px 16px 16px',
      background: BG,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button style={{ background: 'transparent', padding: 4 }} onClick={onMenuOpen}>
          <IconMenu />
        </button>
        <span style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>Today</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{ background: 'transparent', padding: 4 }}><IconSearch /></button>
        <button style={{ background: 'transparent', padding: 4 }}><IconFilter /></button>
        <button style={{ background: 'transparent', padding: 4 }}><IconCal /></button>
        <button style={{ background: 'transparent', padding: 4 }}><IconHelp /></button>
      </div>
    </div>
  )
}

// ── Date Strip ───────────────────────────────────────────────
function DateStrip({ dates, selectedDate, todayStr, onSelect, stripRef }) {
  useEffect(() => {
    if (stripRef.current) {
      const el = stripRef.current.querySelector('[data-today="true"]')
      if (el) el.scrollIntoView({ inline: 'center', behavior: 'instant', block: 'nearest' })
    }
  }, [stripRef])

  return (
    <div
      ref={stripRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        gap: 8,
        padding: '4px 16px 16px',
        scrollbarWidth: 'none',
      }}
    >
      {dates.map((d) => {
        const iso        = dateToISO(d)
        const isSelected = iso === selectedDate
        const isToday    = iso === todayStr

        return (
          <button
            key={iso}
            data-today={isToday ? 'true' : undefined}
            onClick={() => onSelect(iso)}
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 68,
              borderRadius: 14,
              background: isSelected ? 'transparent' : CARD,
              padding: 0,
              border: 'none',
            }}
          >
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: isSelected ? ACCENT : TEXT2,
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              {DAY_NAMES[d.getDay()]}
            </span>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: isSelected ? ACCENT : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontSize: 16,
                fontWeight: 700,
                color: isSelected ? '#fff' : TEXT,
              }}>
                {d.getDate()}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Section Header ───────────────────────────────────────────
function SectionHeader({ title, extraStyle }) {
  return (
    <p style={{
      fontSize: 12,
      fontWeight: 700,
      color: TEXT2,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      marginBottom: 12,
      marginTop: 8,
      ...extraStyle
    }}>
      {title}
    </p>
  )
}

// ── Habit Row ────────────────────────────────────────────────
function HabitRow({ habit, status, onCycle, isLast }) {
  const { name, categories } = habit
  const icon     = categories?.icon || habit.category_icon || null
  const catColor = categories?.color || habit.category_color || habit.color || '#6C63FF'
  const label    = categories?.name || habit.category_name || 'Habit'

  const toggleBg     = status === 'completed' ? SUCCESS : status === 'missed' ? ACCENT : 'transparent'
  const toggleBorder = status === 'completed' ? SUCCESS : status === 'missed' ? ACCENT : '#444'

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
        {/* Colored rounded square icon */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: catColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon
            ? <span style={{ fontSize: 20 }}>{icon}</span>
            : <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{name?.charAt(0).toUpperCase()}</span>
          }
        </div>

        {/* Name + category pill */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{
              fontSize: 15,
              fontWeight: 700,
              color: TEXT,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {name}
            </p>
            <PriorityPill priority={habit.priority} />
          </div>
          <span style={{
            display: 'inline-block',
            marginTop: 4,
            fontSize: 11,
            fontWeight: 600,
            color: catColor,
            background: catColor + '33',
            borderRadius: 6,
            padding: '2px 8px',
          }}>
            {label}
          </span>
        </div>

        {/* 3-state toggle */}
        <button
          onClick={onCycle}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: `2px solid ${toggleBorder}`,
            background: toggleBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
            transition: 'all 0.2s',
          }}
        >
          {status === 'completed' && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {status === 'missed' && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {!isLast && <div style={{ height: 1, background: '#2A2A2A', marginLeft: 56 }} />}
    </>
  )
}

// ── Task Row ─────────────────────────────────────────────────
function TaskRow({ task, status, onToggle, isLast }) {
  const { name, categories } = task
  const icon     = categories?.icon || task.category_icon || null
  const catColor = categories?.color || task.category_color || '#6C63FF'
  const isDone   = status === 'completed'
  const isNot    = status === 'not_completed'
  const isRecurring = task.task_type === 'recurring'

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
        {/* Colored rounded square icon (same style as habit card) */}
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: catColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon
            ? <span style={{ fontSize: 20 }}>{icon}</span>
            : <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{name?.charAt(0).toUpperCase()}</span>
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{
              fontSize: 15,
              fontWeight: 700,
              color: (isDone || isNot) ? TEXT2 : TEXT,
              textDecoration: isDone ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {name}
            </p>
            <PriorityPill priority={task.priority} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 600,
              color: '#888888',
              background: '#88888822',
              borderRadius: 6,
              padding: '2px 8px',
            }}>
              Task
            </span>
            {isRecurring && (
              <span style={{ fontSize: 12 }}>🔄</span>
            )}
          </div>
        </div>

        <button
          onClick={onToggle}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: `2px solid ${isDone ? SUCCESS : isNot ? ACCENT : '#444'}`,
            background: isDone ? SUCCESS : isNot ? ACCENT : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: 0,
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
        >
          {isDone && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {isNot && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {!isLast && <div style={{ height: 1, background: '#2A2A2A', marginLeft: 56 }} />}
    </>
  )
}

// ── Skeleton ─────────────────────────────────────────────────
function SkeletonList({ count = 3 }) {
  return (
    <div style={{ padding: '12px 0' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 56, marginBottom: 10, borderRadius: 12 }} />
      ))}
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px',
      border: '1px dashed #2A2A2A',
      borderRadius: 14,
      margin: '8px 0',
    }}>
      <span style={{ fontSize: 32, marginBottom: 10 }}>{icon}</span>
      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: TEXT }}>{title}</p>
      <p style={{ color: TEXT2, fontSize: 13 }}>{subtitle}</p>
    </div>
  )
}

// ── FAB ──────────────────────────────────────────────────────
function FAB({ onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        position: 'fixed',
        bottom: 88,
        right: '50%',
        transform: 'translateX(175px)',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: ACCENT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 20px ${ACCENT}66`,
        zIndex: 90,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <IconPlus />
    </button>
  )
}

// ── Bottom Sheet ─────────────────────────────────────────────
const SHEET_OPTIONS = [
  { icon: '🔄', label: 'Add Habit',          sub: 'Track a recurring habit'   },
  { icon: '✅', label: 'Add Single Task',     sub: 'Add a one-time task'       },
  { icon: '🔁', label: 'Add Recurring Task',  sub: 'Create a repeating task'   },
]

function BottomSheet({ onClose, onAddHabit, onAddSingleTask, onAddRecurringTask }) {
  const handlers = [onAddHabit, onAddSingleTask, onAddRecurringTask]
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 200,
        }}
      />
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 390,
        background: '#1A1A1A',
        borderRadius: '20px 20px 0 0',
        padding: '16px 20px 44px',
        zIndex: 201,
      }}>
        <div style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          background: '#444',
          margin: '0 auto 20px',
        }} />

        <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 16 }}>
          Create New
        </p>

        {SHEET_OPTIONS.map((opt, i) => (
          <button
            key={opt.label}
            onClick={handlers[i]}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              padding: '16px',
              background: '#252525',
              borderRadius: 14,
              marginBottom: 10,
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: ACCENT + '22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
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

// ── Main Screen ──────────────────────────────────────────────
export default function TodayScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const todayStr = toISODate()

  const [selectedDate,   setSelectedDate]   = useState(todayStr)
  const [habits,         setHabits]         = useState([])
  const [tasks,          setTasks]          = useState([])
  const [habitStatusMap, setHabitStatusMap] = useState({})
  const [taskStatusMap,  setTaskStatusMap]  = useState({})
  const [habitsLoading, setHabitsLoading] = useState(true)
  const [tasksLoading,  setTasksLoading]  = useState(true)
  const [showSheet,     setShowSheet]     = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const stripRef = useRef(null)
  const dates    = generateDateStrip(todayStr, 14)

  const loadHabits = useCallback(async (date) => {
    setHabitsLoading(true)
    try {
      console.log('[TodayScreen] fetching habits for selected date:', date)
      const [habitsData, logsData] = await Promise.all([
        habitsService.getByDate(date),
        habitsService.getLogsByDate(date),
      ])
      console.log('[TodayScreen] raw habitsData response:', habitsData)
      const arr  = Array.isArray(habitsData) ? habitsData : (habitsData?.habits ?? habitsData?.data ?? [])
      const logs = Array.isArray(logsData)   ? logsData   : (logsData?.logs   ?? logsData?.data  ?? [])

      console.log('[TodayScreen] habits for', date, ':', arr)
      console.log('[TodayScreen] habit-logs for', date, ':', logs)

      const logsMap = {}
      logs.forEach(log => { logsMap[log.habit_id] = log })

      const map = {}
      arr.forEach(h => {
        const log = logsMap[h.id]
        if (log) map[h.id] = { id: log.id, status: log.status }
      })

      setHabits(arr)
      setHabitStatusMap(map)
    } catch (err) {
      console.error('[TodayScreen] loadHabits error:', err)
    }
    finally { setHabitsLoading(false) }
  }, [])

  const loadTasks = useCallback(async (date) => {
    setTasksLoading(true)
    try {
      console.log('[TodayScreen] GET /task-logs/date/:date — date:', date)
      const [tasksData, logsData] = await Promise.all([
        tasksService.getAll({ date, type: 'single' }),
        tasksService.getLogsByDate(date),
      ])

      const arr  = Array.isArray(tasksData) ? tasksData : (tasksData?.tasks ?? tasksData?.data ?? [])
      const logs = Array.isArray(logsData)  ? logsData  : (logsData?.logs  ?? logsData?.data  ?? [])

      console.log('raw taskLogs:', JSON.stringify(logs))
      console.log('tasks:', arr.map(t => t.id))
      logs.forEach(log => {
        console.log('log task_id:', log.task_id, 'matches task?', arr.some(t => t.id === log.task_id))
      })

      const logsMap = {}
      logs.forEach(log => { logsMap[log.task_id] = { id: log.id, status: log.status } })

      const map = {}
      arr.forEach(t => {
        map[t.id] = logsMap[t.id] ?? { id: null, status: '' }
      })

      console.log('[TodayScreen] taskStatusMap for', date, ':', map)

      setTasks(arr)
      setTaskStatusMap(map)
    } catch (err) {
      console.error('[TodayScreen] loadTasks error:', err)
    }
    finally { setTasksLoading(false) }
  }, [])

  // Run on mount with today's date and whenever the selected date or route key changes
  useEffect(() => {
    console.log('[TodayScreen] useEffect triggered — selectedDate:', selectedDate)
    loadHabits(selectedDate)
    loadTasks(selectedDate)
  }, [selectedDate, location.key])

  const cycleHabitStatus = async (id) => {
    const entry  = habitStatusMap[id] ?? { id: null, status: null }
    const logId  = entry.id
    const status = entry.status

    if (!logId) {
      // No log → completed: POST
      setHabitStatusMap(prev => ({ ...prev, [id]: { id: null, status: 'completed' } }))
      try {
        const newLog = await habitsService.log(id, { log_date: selectedDate, status: 'completed' })
        if (newLog?.id) {
          setHabitStatusMap(prev => ({ ...prev, [id]: { id: newLog.id, status: 'completed' } }))
        }
      } catch {
        setHabitStatusMap(prev => { const n = { ...prev }; delete n[id]; return n })
      }
    } else if (status === 'completed') {
      // completed → missed: PUT
      setHabitStatusMap(prev => ({ ...prev, [id]: { id: logId, status: 'missed' } }))
      try {
        await habitsService.updateLog(logId, { status: 'missed' })
      } catch {
        setHabitStatusMap(prev => ({ ...prev, [id]: entry }))
      }
    } else if (status === 'missed') {
      // missed → no log: DELETE
      setHabitStatusMap(prev => { const n = { ...prev }; delete n[id]; return n })
      try {
        await habitsService.deleteLog(logId)
      } catch {
        setHabitStatusMap(prev => ({ ...prev, [id]: entry }))
      }
    } else {
      // not_completed → completed: PUT
      setHabitStatusMap(prev => ({ ...prev, [id]: { id: logId, status: 'completed' } }))
      try {
        await habitsService.updateLog(logId, { status: 'completed' })
      } catch {
        setHabitStatusMap(prev => ({ ...prev, [id]: entry }))
      }
    }
  }

  const toggleTask = async (id) => {
    const entry  = taskStatusMap[id] ?? { id: null, status: '' }
    const logId  = entry.id
    const current = entry.status

    if (!logId) {
      // No log → POST to create with 'completed'
      console.log('[toggleTask] POST /task-logs — log_date:', selectedDate)
      setTaskStatusMap(prev => ({ ...prev, [id]: { id: null, status: 'completed' } }))
      try {
        const newLog = await tasksService.createLog(id, 'completed', selectedDate)
        if (newLog?.id) {
          setTaskStatusMap(prev => ({ ...prev, [id]: { id: newLog.id, status: newLog.status } }))
        }
      } catch {
        setTaskStatusMap(prev => ({ ...prev, [id]: entry }))
      }
    } else if (current === 'not_completed') {
      // not_completed → PUT to completed
      setTaskStatusMap(prev => ({ ...prev, [id]: { id: logId, status: 'completed' } }))
      try {
        await tasksService.updateLog(logId, { status: 'completed' })
      } catch {
        setTaskStatusMap(prev => ({ ...prev, [id]: entry }))
      }
    } else {
      // completed → DELETE log
      setTaskStatusMap(prev => ({ ...prev, [id]: { id: null, status: '' } }))
      try {
        await tasksService.deleteLog(logId)
      } catch {
        setTaskStatusMap(prev => ({ ...prev, [id]: entry }))
      }
    }
  }

  // Sorted habits and tasks
  const sortedHabits = useMemo(() => sortItems(habits, habitStatusMap), [habits, habitStatusMap])
  const sortedTasks  = useMemo(() => sortItems(tasks, taskStatusMap),   [tasks, taskStatusMap])

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 90, position: 'relative', overflow: 'hidden' }}>
      <Header onMenuOpen={() => setShowMenu(true)} />
      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      <DateStrip
        dates={dates}
        selectedDate={selectedDate}
        todayStr={todayStr}
        onSelect={setSelectedDate}
        stripRef={stripRef}
      />

      <div style={{ padding: '0 16px' }}>
        {/* Habits */}
        <SectionHeader title="Habits" />
        <div style={{ background: CARD, borderRadius: 18, padding: '0 16px', marginBottom: 24 }}>
          {habitsLoading ? (
            <SkeletonList count={3} />
          ) : sortedHabits.length === 0 ? (
            <EmptyState icon="✨" title="No habits for today" subtitle="Tap + to add your first habit" />
          ) : (
            sortedHabits.map((habit, idx) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                status={habitStatusMap[habit.id]?.status || ''}
                onCycle={() => cycleHabitStatus(habit.id)}
                isLast={idx === sortedHabits.length - 1}
              />
            ))
          )}
        </div>

        {/* Tasks */}
        <SectionHeader title="Tasks" />
        <div style={{ background: CARD, borderRadius: 18, padding: '0 16px', marginBottom: 24 }}>
          {tasksLoading ? (
            <SkeletonList count={2} />
          ) : sortedTasks.length === 0 ? (
            <EmptyState icon="✅" title="No tasks for today" subtitle="Tap + to add a task" />
          ) : (
            sortedTasks.map((task, idx) => {
              console.log('task', task.id, 'status:', taskStatusMap[task.id])
              console.log('rendering task:', task.id, 'statusMap entry:', JSON.stringify(taskStatusMap[task.id]))
              const logEntry = taskStatusMap[task.id]
              const status = logEntry ? logEntry.status : null
              return (
                <TaskRow
                  key={task.id}
                  task={task}
                  status={status || ''}
                  onToggle={() => toggleTask(task.id)}
                  isLast={idx === sortedTasks.length - 1}
                />
              )
            })
          )}
        </div>
      </div>

      <FAB onPress={() => setShowSheet(true)} />

      {showSheet && (
        <BottomSheet
          onClose={() => setShowSheet(false)}
          onAddHabit={() => { setShowSheet(false); navigate('/add', { state: { tab: 'habit' } }) }}
          onAddSingleTask={() => { setShowSheet(false); navigate('/add', { state: { tab: 'task', taskType: 'single' } }) }}
          onAddRecurringTask={() => { setShowSheet(false); navigate('/add', { state: { tab: 'task', taskType: 'recurring' } }) }}
        />
      )}
    </div>
  )
}
