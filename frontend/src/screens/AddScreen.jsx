import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { habitsService }     from '../services/habits'
import { tasksService }      from '../services/tasks'
import { categoriesService } from '../services/categories'

// ── Constants ─────────────────────────────────────────────────
const ACCENT  = '#E8445A'
const BG      = '#0A0A0A'
const CARD    = '#1A1A1A'
const TEXT    = '#FFFFFF'
const TEXT2   = '#888888'
const BORDER  = '#2A2A2A'


const COLORS    = ['#6C63FF','#EC4899','#F59E0B','#22C55E','#06B6D4','#EF4444','#8B5CF6','#F97316']
const HARDCODED_DEFAULTS = [
  { id: 'default_spiritual',    name: 'Spiritual',        icon: '🙏', color: '#E84545' },
  { id: 'default_quit',         name: 'Quit a bad habit', icon: '🚫', color: '#E84545' },
  { id: 'default_art',          name: 'Art',              icon: '🎨', color: '#FF6B9D' },
  { id: 'default_meditation',   name: 'Meditation',       icon: '🧘', color: '#9B59B6' },
  { id: 'default_study',        name: 'Study',            icon: '📚', color: '#6C63FF' },
  { id: 'default_sports',       name: 'Sports',           icon: '⚽', color: '#3498DB' },
  { id: 'default_gym',          name: 'Gym',              icon: '💪', color: '#2980B9' },
  { id: 'default_entertainment',name: 'Entertainment',    icon: '🎬', color: '#E67E22' },
  { id: 'default_social',       name: 'Social',           icon: '👥', color: '#1ABC9C' },
  { id: 'default_finance',      name: 'Finance',          icon: '💰', color: '#27AE60' },
  { id: 'default_health',       name: 'Health',           icon: '❤️', color: '#E8445A' },
  { id: 'default_running',      name: 'Running',          icon: '🏃', color: '#2ECC71' },
  { id: 'default_work',         name: 'Work',             icon: '💼', color: '#34495E' },
  { id: 'default_nutrition',    name: 'Nutrition',        icon: '🥗', color: '#F39C12' },
  { id: 'default_home',         name: 'Home',             icon: '🏠', color: '#795548' },
  { id: 'default_outdoor',      name: 'Outdoor',          icon: '🌲', color: '#4CAF50' },
  { id: 'default_other',        name: 'Other',            icon: '📌', color: '#95A5A6' },
]
const FREQ_OPTS = [
  { value: 'daily',   label: 'Every Day' },
  { value: 'weekly',  label: 'Specific days of the week' },
  { value: 'monthly', label: 'Specific days of the month' },
  { value: 'period',  label: 'Some days per period' },
  { value: 'repeat',  label: 'Repeat' },
]
const TASK_FREQ_OPTS = [
  { value: 'daily',   label: 'Every day' },
  { value: 'weekly',  label: 'Specific days of week' },
  { value: 'monthly', label: 'Specific days of month' },
]
const DAY_LABELS    = ['Mo','Tu','We','Th','Fr','Sa','Su']
const MONTH_DAYS    = Array.from({ length: 31 }, (_, i) => i + 1)
const HABIT_TYPES   = [
  { value: 'yes_no',    label: 'Yes / No'  },
  { value: 'numeric',   label: 'Numeric'   },
  { value: 'timer',     label: 'Timer'     },
  { value: 'checklist', label: 'Checklist' },
]
const TASK_HABIT_TYPES = [
  { value: 'yes_no',    label: 'Yes / No'  },
  { value: 'checklist', label: 'Checklist' },
]
const HABIT_PRIORITY_OPTS = [
  { value: 'low',    label: 'Low',    color: '#22C55E' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high',   label: 'High',   color: '#EF4444' },
]
const TASK_PRIORITY_OPTS = [
  { value: '',       label: 'Default', color: TEXT2    },
  { value: 'low',    label: 'Low',     color: '#22C55E' },
  { value: 'medium', label: 'Medium',  color: '#F59E0B' },
  { value: 'high',   label: 'High',    color: '#EF4444' },
]

// ── Helpers ───────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function formatDateLabel(iso) {
  if (!iso) return 'Today'
  const today    = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const todayStr    = today.toISOString().split('T')[0]
  const tomorrowStr = tomorrow.toISOString().split('T')[0]
  if (iso === todayStr)    return 'Today'
  if (iso === tomorrowStr) return 'Tomorrow'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── SVG Icons ─────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEXT2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function IconCheckList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8"  y1="6"  x2="21" y2="6"/>
      <line x1="8"  y1="12" x2="21" y2="12"/>
      <line x1="8"  y1="18" x2="21" y2="18"/>
      <polyline points="3 6 4 7 6 5"/>
      <polyline points="3 12 4 13 6 11"/>
      <polyline points="3 18 4 19 6 17"/>
    </svg>
  )
}

function IconFlag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  )
}

function IconComment() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function IconCheckbox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

// ── Toggle ────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 26, borderRadius: 13, flexShrink: 0,
        background: value ? ACCENT : '#2A2A2A',
        position: 'relative', border: 'none', cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 3,
        left: value ? 25 : 3,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </button>
  )
}

// ── FormRow ───────────────────────────────────────────────────
function FormRow({ icon, label, subtitle, rightContent, onPress, danger }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'flex', alignItems: subtitle ? 'flex-start' : 'center',
        gap: 14, width: '100%',
        padding: '16px 20px',
        background: 'transparent', border: 'none',
        cursor: onPress ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 22, paddingTop: subtitle ? 2 : 0 }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: danger ? '#EF4444' : TEXT }}>
          {label}
        </span>
        {subtitle && (
          <p style={{ fontSize: 12, color: TEXT2, marginTop: 2 }}>{subtitle}</p>
        )}
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {rightContent}
      </span>
    </button>
  )
}

function Divider() {
  return <div style={{ height: 1, background: BORDER, marginLeft: 20 }} />
}

// ── Single Task Form (new design) ─────────────────────────────
function TaskForm({ editTask, categories, defaultCats, onBack }) {
  const navigate  = useNavigate()
  const today     = todayISO()
  const tomorrow  = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [name,      setName]      = useState(editTask?.name || '')
  const [catId,     setCatId]     = useState(
    String(editTask?.category_id || editTask?.categories?.id || '')
  )
  const [dueDate,   setDueDate]   = useState(editTask?.due_date || tomorrow)
  const [priority,  setPriority]  = useState(editTask?.priority || '')
  const [note,      setNote]      = useState(editTask?.description || '')
  const [isPending, setIsPending] = useState(editTask?.is_pending ?? false)
  const [reminder,  setReminder]  = useState(
    editTask?.reminder_enabled ? (editTask.reminder_time || '08:00') : ''
  )
  const [checklist, setChecklist] = useState([])
  const [newItem,   setNewItem]   = useState('')

  const [expanded,          setExpanded]          = useState(null)
  const [nameFocused,       setNameFocused]       = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading,           setLoading]           = useState(false)
  const [error,             setError]             = useState('')

  const selCat      = catId
    ? (categories.find(c => String(c.id) === catId) || defaultCats.find(c => c.id === catId))
    : null
  const selPriority = TASK_PRIORITY_OPTS.find(p => p.value === priority) || TASK_PRIORITY_OPTS[0]

  function toggleExpand(row) {
    setExpanded(prev => prev === row ? null : row)
  }

  function addChecklistItem() {
    if (!newItem.trim()) return
    setChecklist(prev => [...prev, { id: Date.now(), text: newItem.trim() }])
    setNewItem('')
  }

  async function handleSave() {
    if (!name.trim()) return false
    setError('')
    setLoading(true)
    try {
      const defaultCat = HARDCODED_DEFAULTS.find(c => c.id === catId)
      const payload = {
        name:        name.trim(),
        category_id: defaultCat ? null : (catId || null),
        due_date:    dueDate  || tomorrow,
        priority:    priority || undefined,
        description: note     || undefined,
        is_pending:  isPending,
        task_type:   'single',
        ...(defaultCat ? {
          category_name:       defaultCat.name,
          category_icon:       defaultCat.icon,
          category_color:      defaultCat.color,
          category_is_default: true,
        } : {}),
      }
      console.log('habit creation payload:', JSON.stringify(payload))
      if (editTask?.id) {
        await tasksService.update(editTask.id, payload)
      } else {
        await tasksService.create(payload)
      }
      return true
    } catch (err) {
      setError(err.message || 'Failed to save task')
      setLoading(false)
      return false
    }
  }

  async function handleBackSave() {
    if (!name.trim()) { onBack(); return }
    const saved = await handleSave()
    if (saved) navigate('/tasks')
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await tasksService.delete(editTask.id)
      navigate('/tasks')
    } catch (err) {
      setError(err.message || 'Failed to delete task')
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: BG, minHeight: '100vh', maxWidth: 390,
      margin: '0 auto', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 8px' }}>
        <button
          type="button"
          onClick={handleBackSave}
          disabled={loading}
          style={{ background: 'none', border: 'none', padding: 4, cursor: loading ? 'default' : 'pointer', display: 'flex', opacity: loading ? 0.5 : 1 }}
        >
          <IconBack />
        </button>
        <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
          {editTask ? 'Edit task' : 'New Task'}
        </span>
      </div>

      {/* Task name */}
      <div style={{ padding: '8px 20px 16px' }}>
        <input
          type="text"
          placeholder="Task name"
          value={name}
          onChange={e => setName(e.target.value)}
          onFocus={() => setNameFocused(true)}
          onBlur={() => setNameFocused(false)}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            borderBottom: `2px solid ${nameFocused ? ACCENT : BORDER}`,
            color: TEXT, fontSize: 17, fontWeight: 600,
            padding: '8px 0 10px', outline: 'none',
            boxSizing: 'border-box', transition: 'border-color 0.2s',
          }}
        />
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>

        {/* Category */}
        <Divider />
        <FormRow
          icon={<IconGrid />}
          label="Category"
          rightContent={
            selCat
              ? <span style={{ fontSize: 13, color: selCat.color || ACCENT, fontWeight: 600 }}>
                  {selCat.icon && <span style={{ marginRight: 4 }}>{selCat.icon}</span>}
                  {selCat.name}
                </span>
              : <span style={{ fontSize: 13, color: TEXT2 }}>None</span>
          }
          onPress={() => toggleExpand('category')}
        />
        {expanded === 'category' && (
          <div style={{ padding: '4px 20px 14px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                type="button"
                onClick={() => { setCatId(''); setExpanded(null) }}
                style={{
                  padding: '7px 14px', borderRadius: 20,
                  background: !catId ? ACCENT + '22' : CARD,
                  border: `1.5px solid ${!catId ? ACCENT : BORDER}`,
                  color: !catId ? ACCENT : TEXT2, fontSize: 13, fontWeight: 500,
                }}
              >
                None
              </button>
              {categories.length > 0 && (
                <>
                  <div style={{ width: '100%', fontSize: 11, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 4 }}>Custom</div>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setCatId(String(c.id)); setExpanded(null) }}
                      style={{
                        padding: '7px 14px', borderRadius: 20,
                        background: catId === String(c.id) ? (c.color || ACCENT) + '22' : CARD,
                        border: `1.5px solid ${catId === String(c.id) ? (c.color || ACCENT) : BORDER}`,
                        color: catId === String(c.id) ? (c.color || ACCENT) : TEXT2,
                        fontSize: 13, fontWeight: 500,
                      }}
                    >
                      {c.icon && <span style={{ marginRight: 4 }}>{c.icon}</span>}
                      {c.name}
                    </button>
                  ))}
                </>
              )}
              <div style={{ width: '100%', fontSize: 11, fontWeight: 600, color: TEXT2, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: categories.length > 0 ? 4 : 0 }}>Default</div>
              {defaultCats.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setCatId(c.id); setExpanded(null) }}
                  style={{
                    padding: '7px 14px', borderRadius: 20,
                    background: catId === c.id ? (c.color || ACCENT) + '22' : CARD,
                    border: `1.5px solid ${catId === c.id ? (c.color || ACCENT) : BORDER}`,
                    color: catId === c.id ? (c.color || ACCENT) : TEXT2,
                    fontSize: 13, fontWeight: 500,
                  }}
                >
                  <span style={{ marginRight: 4 }}>{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <Divider />
        <FormRow
          icon={<IconCalendar />}
          label="Date"
          rightContent={
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: ACCENT + '22', color: ACCENT, fontSize: 13, fontWeight: 600,
            }}>
              {formatDateLabel(dueDate)}
            </span>
          }
          onPress={() => toggleExpand('date')}
        />
        {expanded === 'date' && (
          <div style={{ padding: '4px 20px 14px' }}>
            <input
              type="date"
              value={dueDate}
              onChange={e => { setDueDate(e.target.value); setExpanded(null) }}
              style={{
                width: '100%', background: CARD,
                border: `1.5px solid ${BORDER}`, borderRadius: 12,
                color: TEXT, fontSize: 14, padding: '10px 14px',
                colorScheme: 'dark', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Time and reminders */}
        <Divider />
        <FormRow
          icon={<IconBell />}
          label="Time and reminders"
          rightContent={
            <span style={{
              minWidth: 22, height: 22, borderRadius: 11, padding: '0 7px',
              background: reminder ? ACCENT : '#333',
              color: reminder ? '#fff' : TEXT2,
              fontSize: 12, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {reminder ? 1 : 0}
            </span>
          }
          onPress={() => toggleExpand('reminders')}
        />
        {expanded === 'reminders' && (
          <div style={{ padding: '4px 20px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: TEXT2, fontSize: 13 }}>Enable reminder</span>
              <Toggle value={!!reminder} onChange={v => setReminder(v ? '08:00' : '')} />
            </div>
            {reminder && (
              <input
                type="time"
                value={reminder}
                onChange={e => setReminder(e.target.value)}
                style={{
                  background: CARD, border: `1.5px solid ${BORDER}`,
                  borderRadius: 10, color: TEXT, fontSize: 14,
                  padding: '10px 14px', colorScheme: 'dark',
                }}
              />
            )}
          </div>
        )}

        {/* Checklist */}
        <Divider />
        <FormRow
          icon={<IconCheckList />}
          label="Checklist"
          rightContent={
            <span style={{
              minWidth: 22, height: 22, borderRadius: 11, padding: '0 7px',
              background: checklist.length > 0 ? ACCENT : '#333',
              color: checklist.length > 0 ? '#fff' : TEXT2,
              fontSize: 12, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {checklist.length}
            </span>
          }
          onPress={() => toggleExpand('checklist')}
        />
        {expanded === 'checklist' && (
          <div style={{ padding: '4px 20px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checklist.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, color: TEXT, flex: 1 }}>{item.text}</span>
                <button
                  type="button"
                  onClick={() => setChecklist(prev => prev.filter(i => i.id !== item.id))}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                >
                  ×
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Add item…"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                style={{
                  flex: 1, background: CARD, border: `1.5px solid ${BORDER}`,
                  borderRadius: 10, color: TEXT, fontSize: 14,
                  padding: '8px 12px', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={addChecklistItem}
                style={{
                  padding: '8px 14px', borderRadius: 10,
                  background: ACCENT, color: '#fff', border: 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: 600,
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Priority */}
        <Divider />
        <FormRow
          icon={<IconFlag />}
          label="Priority"
          rightContent={
            <span style={{
              padding: '4px 12px', borderRadius: 20,
              background: selPriority.value ? selPriority.color + '22' : '#333',
              color: selPriority.value ? selPriority.color : TEXT2,
              fontSize: 13, fontWeight: 600,
            }}>
              {selPriority.label}
            </span>
          }
          onPress={() => toggleExpand('priority')}
        />
        {expanded === 'priority' && (
          <div style={{ padding: '4px 20px 14px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TASK_PRIORITY_OPTS.map(opt => (
              <button
                key={opt.value || 'default'}
                type="button"
                onClick={() => { setPriority(opt.value); setExpanded(null) }}
                style={{
                  padding: '8px 16px', borderRadius: 20,
                  background: priority === opt.value
                    ? (opt.value ? opt.color + '22' : '#444')
                    : CARD,
                  border: `1.5px solid ${priority === opt.value
                    ? (opt.value ? opt.color : '#666')
                    : BORDER}`,
                  color: priority === opt.value
                    ? (opt.value ? opt.color : TEXT)
                    : TEXT2,
                  fontSize: 13, fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Note */}
        <Divider />
        <FormRow
          icon={<IconComment />}
          label="Note"
          rightContent={
            note
              ? <span style={{ fontSize: 12, color: TEXT2, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note}</span>
              : <IconChevronRight />
          }
          onPress={() => toggleExpand('note')}
        />
        {expanded === 'note' && (
          <div style={{ padding: '4px 20px 14px' }}>
            <textarea
              placeholder="Add a note…"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              style={{
                width: '100%', background: CARD, border: `1.5px solid ${BORDER}`,
                borderRadius: 12, color: TEXT, fontSize: 14,
                padding: '10px 14px', resize: 'none', outline: 'none',
                boxSizing: 'border-box', fontFamily: 'inherit',
              }}
            />
          </div>
        )}

        {/* Pending task */}
        <Divider />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 22 }}>
            <IconCheckbox />
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 2 }}>Pending task</p>
            <p style={{ fontSize: 12, color: TEXT2 }}>It will be shown each day until completed</p>
          </div>
          <Toggle value={isPending} onChange={setIsPending} />
        </div>

        {/* Delete (edit mode only) */}
        {editTask && (
          <>
            <Divider />
            <FormRow
              icon={<IconTrash />}
              label="Delete"
              danger
              onPress={() => setShowDeleteConfirm(true)}
            />
          </>
        )}

        <Divider />
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '4px 20px 8px', color: '#EF4444', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <>
          <div
            onClick={() => setShowDeleteConfirm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300 }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 48px)', maxWidth: 320,
            background: CARD, borderRadius: 20,
            padding: '28px 24px', zIndex: 301, textAlign: 'center',
          }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 8 }}>Delete Task?</p>
            <p style={{ fontSize: 14, color: TEXT2, marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  background: '#2A2A2A', color: TEXT,
                  border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); handleDelete() }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  background: '#EF4444', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Habit Form (existing design, updated accent) ───────────────
function HabitForm({ editHabit, categories, defaultCats, onBack }) {
  const navigate = useNavigate()
  const editId   = editHabit?.id || null

  const [hName,            setHName]            = useState(editHabit?.name || '')
  const [hDesc,            setHDesc]            = useState(editHabit?.description || '')
  const [hColor,           setHColor]           = useState(editHabit?.color || COLORS[0])
  const [hFreq,            setHFreq]            = useState(editHabit?.frequency || 'daily')
  const [hDays,            setHDays]            = useState(editHabit?.target_days || [])
  const [hMonthDays,       setHMonthDays]       = useState(
    Array.isArray(editHabit?.custom_days) ? editHabit.custom_days : []
  )
  const [hPeriodCount,     setHPeriodCount]     = useState(() => {
    const cd = editHabit?.custom_days
    return (cd && !Array.isArray(cd) && cd.count) ? cd.count : 3
  })
  const [hPeriodUnit,      setHPeriodUnit]      = useState(() => {
    const cd = editHabit?.custom_days
    return (cd && !Array.isArray(cd) && cd.period) ? cd.period : 'week'
  })
  const [hRepeatEvery,     setHRepeatEvery]     = useState(() => {
    const cd = editHabit?.custom_days
    return (cd && !Array.isArray(cd) && cd.every) ? cd.every : 3
  })
  const [hCategory,        setHCategory]        = useState(() => {
    if (editHabit?.category_id || editHabit?.categories?.id) {
      return String(editHabit.category_id || editHabit.categories.id)
    }
    if (editHabit?.category_name) {
      const def = HARDCODED_DEFAULTS.find(c => c.name === editHabit.category_name)
      if (def) return def.id
    }
    return ''
  })
  const [hStartDate,       setHStartDate]       = useState((editHabit?.start_date || '').split('T')[0] || todayISO())
  const [hEndDate,         setHEndDate]         = useState((editHabit?.end_date || '').split('T')[0] || '')
  const [hHabitType,       setHHabitType]       = useState(editHabit?.habit_type || 'yes_no')
  const [hReminderEnabled, setHReminderEnabled] = useState(editHabit?.reminder_enabled || false)
  const [hReminderTime,    setHReminderTime]    = useState(editHabit?.reminder_time || '08:00')
  const [hPriority,        setHPriority]        = useState(editHabit?.priority || 'medium')
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState('')

  useEffect(() => {
    if (!editHabit) return
    setHFreq(editHabit.frequency || 'daily')
    if (editHabit.frequency === 'weekly') {
      setHDays(editHabit.target_days || [])
    }
    if (editHabit.frequency === 'monthly') {
      setHMonthDays(Array.isArray(editHabit.custom_days) ? editHabit.custom_days : [])
    }
    if (editHabit.frequency === 'period') {
      const cd = editHabit.custom_days || {}
      setHPeriodCount(cd.count || 1)
      setHPeriodUnit(cd.period || 'week')
    }
    if (editHabit.frequency === 'repeat') {
      const cd = editHabit.custom_days || {}
      setHRepeatEvery(cd.every || 1)
    }
  }, [editHabit])

  function toggleDay(day, setDays) {
    setDays(prev =>
      (prev || []).includes(day) ? (prev || []).filter(d => d !== day) : [...(prev || []), day].sort((a,b) => a-b)
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const defaultCat = HARDCODED_DEFAULTS.find(c => c.id === hCategory)
      const habitData = {
        name:             hName,
        description:      hDesc        || undefined,
        color:            hColor,
        frequency:   hFreq,
        target_days: hFreq === 'daily'  ? [1,2,3,4,5,6,7]
                   : hFreq === 'weekly' ? hDays
                   : [],
        custom_days: hFreq === 'monthly' ? hMonthDays
                   : hFreq === 'period'  ? { count: hPeriodCount, period: hPeriodUnit }
                   : hFreq === 'repeat'  ? { every: hRepeatEvery }
                   : null,
        habit_type:       hHabitType,
        start_date:       hStartDate   || undefined,
        end_date:         hEndDate     || undefined,
        reminder_enabled: hReminderEnabled,
        reminder_time:    hReminderEnabled ? hReminderTime : undefined,
        priority:         hPriority,
        category_id:          defaultCat ? null : (hCategory || null),
        category_name:        defaultCat ? defaultCat.name  : null,
        category_icon:        defaultCat ? defaultCat.icon  : null,
        category_color:       defaultCat ? defaultCat.color : null,
        category_is_default:  defaultCat ? true : null,
      }
      console.log('FINAL HABIT POST BODY:', JSON.stringify(habitData))
      if (editId) {
        await habitsService.update(editId, habitData)
      } else {
        await habitsService.create(habitData)
      }
      navigate('/habits')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          type="button"
          onClick={onBack}
          style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
        >
          <IconBack />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>
          {editId ? 'Edit Habit' : 'New Habit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Habit Name *">
          <input
            type="text" placeholder="e.g. Meditate for 10 minutes"
            value={hName} onChange={e => setHName(e.target.value)}
            required maxLength={255}
          />
        </Field>

        <Field label="Description">
          <textarea
            placeholder="Optional description…"
            value={hDesc} onChange={e => setHDesc(e.target.value)} rows={2}
          />
        </Field>

        <Field label="Color">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 4 }}>
            {COLORS.map(c => (
              <button
                key={c} type="button" onClick={() => setHColor(c)}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: c,
                  border: hColor === c ? '3px solid #fff' : '3px solid transparent',
                  boxShadow: hColor === c ? `0 0 0 2px ${c}` : 'none',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
        </Field>

        <Field label="Frequency">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FREQ_OPTS.map(opt => (
              <button
                key={opt.value} type="button" onClick={() => setHFreq(opt.value)}
                style={{
                  padding: '11px 14px', borderRadius: 12, textAlign: 'left',
                  background: hFreq === opt.value ? ACCENT + '22' : '#1A1A1A',
                  color: hFreq === opt.value ? ACCENT : '#888',
                  fontSize: 13, fontWeight: 500,
                  border: `1.5px solid ${hFreq === opt.value ? ACCENT : '#2A2A2A'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        {hFreq === 'weekly' && (
          <Field label="Days of the Week">
            <div style={{ display: 'flex', gap: 6 }}>
              {DAY_LABELS.map((label, i) => {
                const day = i + 1; const active = (hDays || []).includes(day)
                return (
                  <button
                    key={day} type="button" onClick={() => toggleDay(day, setHDays)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      background: active ? ACCENT : '#1A1A1A',
                      color: active ? '#fff' : '#555', fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${active ? ACCENT : '#2A2A2A'}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </Field>
        )}

        {hFreq === 'monthly' && (
          <Field label="Days of the Month">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MONTH_DAYS.map(day => {
                const active = (hMonthDays || []).includes(day)
                return (
                  <button
                    key={day} type="button"
                    onClick={() => setHMonthDays(prev =>
                      (prev || []).includes(day) ? (prev || []).filter(d => d !== day) : [...(prev || []), day].sort((a,b) => a-b)
                    )}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: active ? ACCENT : '#1A1A1A',
                      color: active ? '#fff' : '#555', fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${active ? ACCENT : '#2A2A2A'}`,
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </Field>
        )}

        {hFreq === 'period' && (
          <Field label="Days per Period">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="number" min={1} max={366} value={hPeriodCount}
                onChange={e => setHPeriodCount(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: 64, background: '#1A1A1A', border: `1.5px solid #2A2A2A`,
                  borderRadius: 10, color: TEXT, fontSize: 15, fontWeight: 600,
                  padding: '10px', textAlign: 'center', outline: 'none',
                }}
              />
              <span style={{ color: TEXT2, fontSize: 13 }}>days per</span>
              <select
                value={hPeriodUnit}
                onChange={e => setHPeriodUnit(e.target.value)}
                style={{
                  flex: 1, background: '#1A1A1A', border: `1.5px solid #2A2A2A`,
                  borderRadius: 10, color: TEXT, fontSize: 13, padding: '10px 12px',
                  outline: 'none', colorScheme: 'dark',
                }}
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </Field>
        )}

        {hFreq === 'repeat' && (
          <Field label="Repeat Interval">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: TEXT2, fontSize: 13 }}>Every</span>
              <input
                type="number" min={1} max={365} value={hRepeatEvery}
                onChange={e => setHRepeatEvery(Math.max(1, parseInt(e.target.value) || 1))}
                style={{
                  width: 64, background: '#1A1A1A', border: `1.5px solid #2A2A2A`,
                  borderRadius: 10, color: TEXT, fontSize: 15, fontWeight: 600,
                  padding: '10px', textAlign: 'center', outline: 'none',
                }}
              />
              <span style={{ color: TEXT2, fontSize: 13 }}>days</span>
            </div>
          </Field>
        )}

        <Field label="Habit Type">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {HABIT_TYPES.map(opt => (
              <button
                key={opt.value} type="button" onClick={() => setHHabitType(opt.value)}
                style={{
                  flex: 1, minWidth: 80, padding: '11px 8px', borderRadius: 12,
                  background: hHabitType === opt.value ? ACCENT : '#1A1A1A',
                  color: hHabitType === opt.value ? '#fff' : '#888',
                  fontSize: 13, fontWeight: 500,
                  border: `1.5px solid ${hHabitType === opt.value ? ACCENT : '#2A2A2A'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Start Date">
          <input type="date" value={hStartDate} onChange={e => setHStartDate(e.target.value)} style={{ colorScheme: 'dark' }} />
        </Field>

        <Field label="End Date (optional)">
          <input type="date" value={hEndDate} onChange={e => setHEndDate(e.target.value)} style={{ colorScheme: 'dark' }} />
        </Field>

        <Field label="Reminder">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa', fontSize: 13 }}>Enable reminder</span>
              <Toggle value={hReminderEnabled} onChange={setHReminderEnabled} />
            </div>
            {hReminderEnabled && (
              <input type="time" value={hReminderTime} onChange={e => setHReminderTime(e.target.value)} style={{ colorScheme: 'dark' }} />
            )}
          </div>
        </Field>

        <Field label="Priority">
          <div style={{ display: 'flex', gap: 8 }}>
            {HABIT_PRIORITY_OPTS.map(opt => (
              <button
                key={opt.value} type="button" onClick={() => setHPriority(opt.value)}
                style={{
                  flex: 1, padding: '11px 8px', borderRadius: 12,
                  background: hPriority === opt.value ? `${opt.color}22` : '#1A1A1A',
                  color: hPriority === opt.value ? opt.color : '#555',
                  fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${hPriority === opt.value ? opt.color : '#2A2A2A'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Category">
          <select value={hCategory} onChange={e => setHCategory(e.target.value)}>
            <option value="">No category</option>
            {categories.length > 0 && (
              <optgroup label="Custom">
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ${c.name}` : c.name}</option>)}
              </optgroup>
            )}
            <optgroup label="Default">
              {defaultCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </optgroup>
          </select>
        </Field>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Saving…' : editId ? 'Save Changes' : 'Add Habit'}
        </button>
      </form>
    </div>
  )
}

// ── Recurring Task Form (existing design) ─────────────────────
function RecurringTaskForm({ categories, defaultCats, onBack }) {
  const navigate = useNavigate()

  const [tName,            setTName]            = useState('')
  const [tDesc,            setTDesc]            = useState('')
  const [tPriority,        setTPriority]        = useState('medium')
  const [tCategory,        setTCategory]        = useState('')
  const [tHabitType,       setTHabitType]       = useState('yes_no')
  const [tFreq,            setTFreq]            = useState('daily')
  const [tDays,            setTDays]            = useState([1,2,3,4,5,6,7])
  const [tStartDate,       setTStartDate]       = useState(todayISO())
  const [tEndDate,         setTEndDate]         = useState('')
  const [tReminderEnabled, setTReminderEnabled] = useState(false)
  const [tReminderTime,    setTReminderTime]    = useState('08:00')
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState('')

  function toggleDay(day) {
    setTDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a,b) => a-b))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const defaultCat = HARDCODED_DEFAULTS.find(c => c.id === tCategory)
      const recurringPayload = {
        name:             tName,
        description:      tDesc        || undefined,
        task_type:        'recurring',
        habit_type:       tHabitType,
        frequency:        tFreq,
        custom_days:      tFreq !== 'daily' ? tDays : undefined,
        start_date:       tStartDate   || undefined,
        end_date:         tEndDate     || undefined,
        reminder_enabled: tReminderEnabled,
        reminder_time:    tReminderEnabled ? tReminderTime : undefined,
        priority:         tPriority,
        category_id:      defaultCat ? null : (tCategory || null),
        ...(defaultCat ? {
          category_name:       defaultCat.name,
          category_icon:       defaultCat.icon,
          category_color:      defaultCat.color,
          category_is_default: true,
        } : {}),
      }
      console.log('habit creation payload:', JSON.stringify(recurringPayload))
      await tasksService.create(recurringPayload)
      navigate('/tasks')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={onBack} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}>
          <IconBack />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>New Recurring Task</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Task Name *">
          <input type="text" placeholder="e.g. Read for 30 minutes" value={tName} onChange={e => setTName(e.target.value)} required maxLength={255} />
        </Field>

        <Field label="Description">
          <textarea placeholder="Optional description…" value={tDesc} onChange={e => setTDesc(e.target.value)} rows={2} />
        </Field>

        <Field label="Habit Type">
          <div style={{ display: 'flex', gap: 8 }}>
            {TASK_HABIT_TYPES.map(opt => (
              <button key={opt.value} type="button" onClick={() => setTHabitType(opt.value)}
                style={{
                  flex: 1, padding: '11px 8px', borderRadius: 12,
                  background: tHabitType === opt.value ? ACCENT : '#1A1A1A',
                  color: tHabitType === opt.value ? '#fff' : '#888',
                  fontSize: 13, fontWeight: 500,
                  border: `1.5px solid ${tHabitType === opt.value ? ACCENT : '#2A2A2A'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Frequency">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TASK_FREQ_OPTS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setTFreq(opt.value)}
                style={{
                  padding: '11px 14px', borderRadius: 12, textAlign: 'left',
                  background: tFreq === opt.value ? ACCENT : '#1A1A1A',
                  color: tFreq === opt.value ? '#fff' : '#888',
                  fontSize: 13, fontWeight: 500,
                  border: `1.5px solid ${tFreq === opt.value ? ACCENT : '#2A2A2A'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        {tFreq === 'weekly' && (
          <Field label="Days of Week">
            <div style={{ display: 'flex', gap: 6 }}>
              {DAY_LABELS.map((label, i) => {
                const day = i + 1; const active = tDays.includes(day)
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      background: active ? ACCENT : '#1A1A1A',
                      color: active ? '#fff' : '#555', fontSize: 12, fontWeight: 600,
                      border: `1.5px solid ${active ? ACCENT : '#2A2A2A'}`,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </Field>
        )}

        {tFreq === 'monthly' && (
          <Field label="Days of Month">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MONTH_DAYS.map(day => {
                const active = tDays.includes(day)
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: active ? ACCENT : '#1A1A1A',
                      color: active ? '#fff' : '#555', fontSize: 13, fontWeight: 600,
                      border: `1.5px solid ${active ? ACCENT : '#2A2A2A'}`,
                    }}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </Field>
        )}

        <Field label="Start Date">
          <input type="date" value={tStartDate} onChange={e => setTStartDate(e.target.value)} style={{ colorScheme: 'dark' }} />
        </Field>

        <Field label="End Date (optional)">
          <input type="date" value={tEndDate} onChange={e => setTEndDate(e.target.value)} style={{ colorScheme: 'dark' }} />
        </Field>

        <Field label="Reminder">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#aaa', fontSize: 13 }}>Enable reminder</span>
              <Toggle value={tReminderEnabled} onChange={setTReminderEnabled} />
            </div>
            {tReminderEnabled && (
              <input type="time" value={tReminderTime} onChange={e => setTReminderTime(e.target.value)} style={{ colorScheme: 'dark' }} />
            )}
          </div>
        </Field>

        <Field label="Priority">
          <div style={{ display: 'flex', gap: 8 }}>
            {HABIT_PRIORITY_OPTS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setTPriority(opt.value)}
                style={{
                  flex: 1, padding: '11px 8px', borderRadius: 12,
                  background: tPriority === opt.value ? `${opt.color}22` : '#1A1A1A',
                  color: tPriority === opt.value ? opt.color : '#555',
                  fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${tPriority === opt.value ? opt.color : '#2A2A2A'}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Category">
          <select value={tCategory} onChange={e => setTCategory(e.target.value)}>
            <option value="">No category</option>
            {categories.length > 0 && (
              <optgroup label="Custom">
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ${c.name}` : c.name}</option>)}
              </optgroup>
            )}
            <optgroup label="Default">
              {defaultCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </optgroup>
          </select>
        </Field>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '12px 16px', color: '#EF4444', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Saving…' : 'Add Recurring Task'}
        </button>
      </form>
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────────
export default function AddScreen() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const editHabit    = location.state?.habit    || null
  const editTask     = location.state?.task     || null
  const initTab      = editTask ? 'task' : (editHabit ? 'habit' : (location.state?.tab || 'habit'))
  const initTaskType = location.state?.taskType || (editTask?.task_type || 'single')

  const [categories,  setCategories]  = useState([])
  const [defaultCats, setDefaultCats] = useState(HARDCODED_DEFAULTS)

  useEffect(() => {
    categoriesService.getCustom()
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.categories || [])
        setCategories(arr)
      })
      .catch(() => {})
  }, [])

  function handleBack() {
    navigate(-1)
  }

  if (initTab === 'task' && initTaskType !== 'recurring') {
    return (
      <TaskForm
        editTask={editTask}
        categories={categories}
        defaultCats={defaultCats}
        onBack={handleBack}
      />
    )
  }

  if (initTab === 'task' && initTaskType === 'recurring') {
    return (
      <RecurringTaskForm
        categories={categories}
        defaultCats={defaultCats}
        onBack={handleBack}
      />
    )
  }

  return (
    <HabitForm
      editHabit={editHabit}
      categories={categories}
      defaultCats={defaultCats}
      onBack={handleBack}
    />
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
