import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { habitsService } from '../services/habits'
import HamburgerMenu from '../components/HamburgerMenu'

// ── Constants ────────────────────────────────────────────────
const BG      = '#0A0A0A'
const CARD    = '#1A1A1A'
const ACCENT  = '#E8445A'
const TEXT    = '#FFFFFF'
const TEXT2   = '#888888'
const SUCCESS = '#4CAF50'
const MISSED  = '#E8445A'
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ── Priority Helpers ──────────────────────────────────────────
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function PriorityPill({ priority }) {
  if (!priority || priority === 'none') return null
  const color = priority === 'high' ? '#E8445A' : priority === 'medium' ? '#FF9500' : '#888888'
  const label = priority.charAt(0).toUpperCase() + priority.slice(1)
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 600,
      color,
      background: color + '33',
      borderRadius: 4,
      padding: '2px 6px',
      marginLeft: 6,
    }}>
      {label}
    </span>
  )
}

// ── Date Helpers ─────────────────────────────────────────────
function dateToISO(d) {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dy = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dy}`
}

function getLast7Days() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d
  })
}

// ── Habit Helpers ────────────────────────────────────────────
// target_days uses 1=Mon…7=Sun; map to DAY_SHORT (0=Sun…6=Sat)
const DAY_NUM_TO_NAME = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' }

function getFrequencyText(habit) {
  const ft = habit.frequency_type || habit.frequency
  const fc = habit.frequency_count

  if (ft === 'daily') return 'Every day'

  if (ft === 'weekly') {
    const days = habit.target_days || []
    if (days.length > 0) {
      return days.map(d => DAY_NUM_TO_NAME[d]).filter(Boolean).join(', ')
    }
    if (!fc || fc === 1) return '1 day per week'
    if (fc === 7) return 'Every day'
    return `${fc} days per week`
  }

  if (ft === 'monthly') {
    const days = Array.isArray(habit.custom_days) ? habit.custom_days : []
    if (days.length > 0) return `Days: ${days.join(', ')} of month`
    return 'Once a month'
  }

  if (ft === 'repeat') {
    const every = habit.custom_days?.every
    if (every) return `Every ${every} days`
    return 'Custom repeat'
  }

  if (ft === 'period') {
    const unit = habit.period_unit || 'week'
    if (fc) return `${fc} days per ${unit}`
    return `Per ${unit}`
  }

  return 'Every day'
}

function calcStreak(logs) {
  const completedDates = new Set(
    logs.filter(l => l.status === 'completed').map(l => (l.log_date || '').split('T')[0])
  )
  let streak = 0
  const d = new Date()
  while (completedDates.has(dateToISO(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function calcCompletion(logs, startDate) {
  const start = startDate ? new Date(startDate) : null
  if (!start || isNaN(start)) return 0
  const totalDays = Math.max(1, Math.floor((new Date() - start) / 86400000) + 1)
  const completed = logs.filter(l => l.status === 'completed').length
  return Math.min(100, Math.round((completed / totalDays) * 100))
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
function IconExport() {
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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5"  y1="12" x2="19" y2="12"/>
    </svg>
  )
}
function IconChain({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )
}
function IconCheckSmall({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function IconCalSmall() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function IconBarChart() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  )
}
function IconDots() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="5"  r="1" fill={TEXT2}/>
      <circle cx="12" cy="12" r="1" fill={TEXT2}/>
      <circle cx="12" cy="19" r="1" fill={TEXT2}/>
    </svg>
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
        <button style={{ background: 'transparent', padding: 4 }} onClick={onMenuOpen}><IconMenu /></button>
        <span style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>Habits</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{ background: 'transparent', padding: 4 }}><IconSearch /></button>
        <button style={{ background: 'transparent', padding: 4 }}><IconFilter /></button>
        <button style={{ background: 'transparent', padding: 4 }}><IconExport /></button>
      </div>
    </div>
  )
}

// ── Menu Option ──────────────────────────────────────────────
function MenuOption({ label, danger, onPress }) {
  return (
    <button
      onClick={onPress}
      style={{
        display: 'block',
        width: '100%',
        padding: '12px 16px',
        textAlign: 'left',
        background: 'transparent',
        fontSize: 14,
        fontWeight: 500,
        color: danger ? ACCENT : TEXT,
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

// ── Confirm Dialog ───────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200 }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#1E1E1E',
        borderRadius: 18,
        padding: '24px 20px',
        width: 300,
        zIndex: 201,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 8 }}>
          Delete Habit
        </p>
        <p style={{ fontSize: 14, color: TEXT2, marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              background: '#2A2A2A',
              color: TEXT,
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              background: ACCENT,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ── Habit Card ───────────────────────────────────────────────
function HabitCard({ habit, logs: initialLogs, onEdit, onArchive, onDelete }) {
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // logMap: { [`${habitId}_${YYYY-MM-DD}`]: { id, status } }
  const [logMap, setLogMap] = useState(() => {
    const m = {}
    initialLogs.forEach(l => {
      const date = (l.log_date || '').split('T')[0]
      if (date) m[`${habit.id}_${date}`] = { id: l.id, status: l.status }
    })
    return m
  })

  const todayISO = dateToISO(new Date())
  const last7    = getLast7Days()
  const icon     = habit.categories?.icon || habit.category_icon || null
  const color    = habit.categories?.color || habit.category_color || habit.color || '#6C63FF'
  const catColor = color
  const freqText = getFrequencyText(habit)

  // Derive a logs array for streak/completion from the logMap
  const logsArr = Object.entries(logMap).map(([key, val]) => ({
    log_date: key.slice(String(habit.id).length + 1),
    status:   val.status,
  }))
  const streak = calcStreak(logsArr)
  const pct    = calcCompletion(logsArr, habit.start_date || habit.created_at)

  const tapDay = async (d) => {
    const iso    = dateToISO(d)
    const key    = `${habit.id}_${iso}`
    const prev   = logMap[key]
    const curStatus = prev?.status

    if (!curStatus) {
      // null → completed: POST
      setLogMap(m => ({ ...m, [key]: { id: null, status: 'completed' } }))
      try {
        const newLog = await habitsService.log(habit.id, { log_date: iso, status: 'completed' })
        if (newLog?.id) setLogMap(m => ({ ...m, [key]: { id: newLog.id, status: 'completed' } }))
      } catch {
        setLogMap(m => { const n = { ...m }; delete n[key]; return n })
      }
    } else if (curStatus === 'completed') {
      // completed → missed: PUT
      setLogMap(m => ({ ...m, [key]: { ...prev, status: 'missed' } }))
      try {
        await habitsService.updateLog(prev.id, { status: 'missed' })
      } catch {
        setLogMap(m => ({ ...m, [key]: prev }))
      }
    } else {
      // missed → grey: DELETE log entirely
      setLogMap(m => { const n = { ...m }; delete n[key]; return n })
      try {
        if (prev.id) await habitsService.deleteLog(prev.id)
      } catch {
        setLogMap(m => ({ ...m, [key]: prev }))
      }
    }
  }

  return (
    <>
      {confirmDelete && (
        <ConfirmDialog
          message="Are you sure you want to delete this habit?"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onDelete(habit.id) }}
        />
      )}

      <div style={{ background: CARD, borderRadius: 16, padding: 16, marginBottom: 12 }}>

        {/* Top row: name + icon square */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>
                {habit.name}
              </p>
              <PriorityPill priority={habit.priority} />
            </div>
            <span style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 600,
              color: catColor,
              background: catColor + '33',
              borderRadius: 6,
              padding: '2px 8px',
            }}>
              {freqText}
            </span>
          </div>

          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: catColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon
              ? <span style={{ fontSize: 18 }}>{icon}</span>
              : <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                  {habit.name?.charAt(0).toUpperCase()}
                </span>
            }
          </div>
        </div>

        {/* Mini Calendar: last 7 days — each circle is tappable */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 14,
          marginBottom: 14,
        }}>
          {last7.map(d => {
            const iso      = dateToISO(d)
            const status   = logMap[`${habit.id}_${iso}`]?.status
            const isToday  = iso === todayISO

            let bgColor     = 'transparent'
            let borderColor = '#333'
            let textColor   = TEXT2

            if (status === 'completed') {
              bgColor = SUCCESS; borderColor = SUCCESS; textColor = '#fff'
            } else if (status === 'missed') {
              bgColor = MISSED; borderColor = MISSED; textColor = '#fff'
            }
            // not_completed / no-log → default grey

            return (
              <button
                key={iso}
                onClick={() => tapDay(d)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                  padding: 0,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 9, color: TEXT2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {DAY_SHORT[d.getDay()]}
                </span>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: bgColor,
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: isToday ? `0 0 0 2px ${color}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: textColor }}>
                    {d.getDate()}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#2A2A2A', marginBottom: 12 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <IconChain color={ACCENT} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{streak}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <IconCheckSmall color={SUCCESS} />
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{pct}%</span>
          </div>

          <div style={{ flex: 1 }} />

          <button style={{ background: 'transparent', padding: 4 }}><IconCalSmall /></button>
          <button style={{ background: 'transparent', padding: 4 }}><IconBarChart /></button>

          {/* 3-dot menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(p => !p)}
              style={{ background: 'transparent', padding: 4 }}
            >
              <IconDots />
            </button>

            {menuOpen && (
              <>
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 4px)',
                  right: 0,
                  background: '#252525',
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
                  zIndex: 50,
                  minWidth: 130,
                }}>
                  <MenuOption label="Edit"    onPress={() => { setMenuOpen(false); onEdit(habit) }} />
                  <div style={{ height: 1, background: '#333' }} />
                  <MenuOption label="Archive" onPress={() => { setMenuOpen(false); onArchive(habit.id) }} />
                  <div style={{ height: 1, background: '#333' }} />
                  <MenuOption label="Delete"  danger onPress={() => { setMenuOpen(false); setConfirmDelete(true) }} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Skeleton ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="skeleton" style={{ height: 196, borderRadius: 16, marginBottom: 12 }} />
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
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#444', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Create New</p>
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
export default function HabitsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [habits,      setHabits]      = useState([])
  const [logsMap,     setLogsMap]     = useState({})
  const [loading,     setLoading]     = useState(true)
  const [deleteError, setDeleteError] = useState('')
  const [showSheet,   setShowSheet]   = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const habitsData = await habitsService.getAll()
      const arr = habitsData || []
      setHabits(arr)
      const logResults = await Promise.all(arr.map(h => habitsService.getLogs(h.id)))
      const map = {}
      arr.forEach((h, i) => { map[h.id] = logResults[i] || [] })
      setLogsMap(map)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll, location])

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      const pDiff = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
      if (pDiff !== 0) return pDiff
      return new Date(a.created_at) - new Date(b.created_at)
    })
  }, [habits])

  const handleEdit = (habit) => {
    navigate('/add', { state: { habit } })
  }

  const handleArchive = async (id) => {
    try {
      await habitsService.archive(id)
      setHabits(prev => prev.filter(h => h.id !== id))
    } catch {}
  }

  const handleDelete = async (id) => {
    console.log(`[HabitsScreen] Deleting habit id=${id} — sending DELETE /habits/${id}`)
    const token = localStorage.getItem('token')
    console.log(`[HabitsScreen] Auth token present: ${!!token}`)
    try {
      await habitsService.delete(id)
      console.log(`[HabitsScreen] Habit ${id} deleted successfully`)
      setHabits(prev => prev.filter(h => h.id !== id))
    } catch (err) {
      console.error(`[HabitsScreen] Delete failed for habit ${id}:`, err)
      console.error(`[HabitsScreen] Status: ${err?.status} — Message: ${err?.message}`)
      setDeleteError(err?.message || 'Failed to delete habit. Please try again.')
    }
  }

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 90, position: 'relative', overflow: 'hidden' }}>
      <Header onMenuOpen={() => setShowMenu(true)} />
      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      <div style={{ padding: '0 16px' }}>
        {deleteError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#3A1A1A',
            border: '1px solid #E8445A55',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 13, color: '#FF6B6B' }}>{deleteError}</span>
            <button
              onClick={() => setDeleteError('')}
              style={{ background: 'transparent', color: TEXT2, fontSize: 16, padding: '0 4px', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : sortedHabits.length === 0 ? (
          <div style={{
            background: CARD,
            borderRadius: 18,
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px dashed #2A2A2A',
            marginTop: 8,
          }}>
            <span style={{ fontSize: 40, marginBottom: 12 }}>🔄</span>
            <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: TEXT }}>No habits yet</p>
            <p style={{ color: TEXT2, fontSize: 13 }}>Tap + to create your first habit</p>
          </div>
        ) : (
          sortedHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              logs={logsMap[habit.id] || []}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))
        )}
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
