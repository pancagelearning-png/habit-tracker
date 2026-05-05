import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoriesService } from '../services/categories'
import { habitsService }     from '../services/habits'
import { tasksService }      from '../services/tasks'
import HamburgerMenu from '../components/HamburgerMenu'

// ── Constants ──────────────────────────────────────────────────
const ACCENT = '#E8445A'
const BG     = '#0A0A0A'
const CARD   = '#1A1A1A'
const TEXT   = '#FFFFFF'
const TEXT2  = '#888888'
const BORDER = '#2A2A2A'


const DEFAULT_CATEGORIES = [
  { name: 'Spiritual',        icon: '🙏', color: '#E84545' },
  { name: 'Quit a bad habit', icon: '🚫', color: '#E84545' },
  { name: 'Art',              icon: '🎨', color: '#FF6B9D' },
  { name: 'Meditation',       icon: '🧘', color: '#9B59B6' },
  { name: 'Study',            icon: '📚', color: '#6C63FF' },
  { name: 'Sports',           icon: '⚽', color: '#3498DB' },
  { name: 'Gym',              icon: '💪', color: '#2980B9' },
  { name: 'Entertainment',    icon: '🎬', color: '#E67E22' },
  { name: 'Social',           icon: '👥', color: '#1ABC9C' },
  { name: 'Finance',          icon: '💰', color: '#27AE60' },
  { name: 'Health',           icon: '❤️', color: '#E8445A' },
  { name: 'Running',          icon: '🏃', color: '#2ECC71' },
  { name: 'Work',             icon: '💼', color: '#34495E' },
  { name: 'Nutrition',        icon: '🥗', color: '#F39C12' },
  { name: 'Home',             icon: '🏠', color: '#795548' },
  { name: 'Outdoor',          icon: '🌲', color: '#4CAF50' },
  { name: 'Other',            icon: '📌', color: '#95A5A6' },
]

const ICON_OPTIONS = [
  '🚫','🚴','🧘','🚶','🏃','🏊','⚾','🏈',
  '🏐','⚽','💪','🎾','🥾','👣','➕','🛏',
  '🏔','🌄','🎭','🔔',
]

const COLOR_OPTIONS = [
  '#E84545','#FF6B6B','#FF6B9D','#FF4ECD',
  '#9B59B6','#6C63FF','#5B8DEF','#3498DB',
  '#2980B9','#1ABC9C','#16A085','#2ECC71',
  '#27AE60','#8BC34A','#CDDC39','#F1C40F',
  '#F39C12','#E67E22','#D35400','#E8445A',
]

// ── SVG Icons ──────────────────────────────────────────────────
function IconBack() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke={TEXT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={TEXT2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3"/>
    </svg>
  )
}

function IconPencil({ color = ACCENT }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function IconImage({ color = ACCENT }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}

function IconContrast({ color = ACCENT }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 1 0 20V2z" fill={color}/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

// ── Category Card (custom grid) ────────────────────────────────
function CategoryCard({ icon, color, name, entryCount, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: '4px 2px',
        width: '100%',
      }}
    >
      <div style={{
        width: 70, height: 70,
        borderRadius: 18,
        background: color + '22',
        border: `2px solid ${color}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
      }}>
        {icon}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 500,
        color: TEXT, textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}>
        {name}
      </span>
      <span style={{ fontSize: 10, color: TEXT2 }}>
        {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
      </span>
    </button>
  )
}

// ── Default Category Card (horizontal row) ─────────────────────
function DefaultCategoryCard({ icon, color, name, entryCount, onPress }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        padding: '4px 2px',
        flexShrink: 0,
        width: 78,
      }}
    >
      <div style={{
        width: 60, height: 60,
        borderRadius: 16,
        background: color + '22',
        border: `2px solid ${color}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
      }}>
        {icon}
      </div>
      <span style={{
        fontSize: 10, fontWeight: 500,
        color: TEXT, textAlign: 'center',
        width: 74,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'block',
      }}>
        {name}
      </span>
      <span style={{ fontSize: 10, color: TEXT2 }}>
        {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
      </span>
    </button>
  )
}

// ── Overlay ────────────────────────────────────────────────────
function Overlay({ onClose, zIndex = 99 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 390,
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        zIndex,
      }}
    />
  )
}

// ── Bottom Sheet ───────────────────────────────────────────────
function BottomSheet({ children, zIndex = 100 }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 390,
      background: CARD,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      zIndex,
      maxHeight: '85vh',
      overflowY: 'auto',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
    }}>
      {children}
    </div>
  )
}

// ── Icon Picker Sheet ──────────────────────────────────────────
function IconPickerSheet({ selected, onSelect, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 390,
      height: '100vh',
      zIndex: 1000,
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: CARD,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: '50vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 20px 4px' }}>
          <p style={{ color: TEXT, fontSize: 16, fontWeight: 700, margin: 0 }}>Select Icon</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          padding: '14px 20px',
        }}>
          {ICON_OPTIONS.map(ic => (
            <button
              key={ic}
              type="button"
              onClick={() => onSelect(ic)}
              style={{
                background: selected === ic ? ACCENT + '22' : '#111',
                border: `2px solid ${selected === ic ? ACCENT : BORDER}`,
                borderRadius: '50%',
                width: 44,
                height: 44,
                fontSize: 22,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                justifySelf: 'center',
                padding: 0,
              }}
            >
              {ic}
            </button>
          ))}
        </div>
        <div style={{ padding: '4px 20px 16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%', padding: '13px 0',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              color: TEXT2, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', letterSpacing: 0.5,
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Color Picker Sheet ─────────────────────────────────────────
function ColorPickerSheet({ selected, onSelect, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 390,
      height: '100vh',
      zIndex: 1000,
    }}>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.7)',
        }}
      />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: CARD,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        maxHeight: '50vh',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '20px 20px 4px' }}>
          <p style={{ color: TEXT, fontSize: 16, fontWeight: 700, margin: 0 }}>Select Color</p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          padding: '16px 20px',
          alignItems: 'center',
          justifyItems: 'center',
        }}>
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onSelect(c)}
              style={{
                background: c,
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `3px solid ${selected === c ? '#fff' : 'transparent'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                boxShadow: selected === c ? `0 0 0 1px ${c}` : 'none',
                flexShrink: 0,
              }}
            >
              {selected === c && (
                <span style={{ color: '#fff', fontSize: 16, fontWeight: 900, lineHeight: 1 }}>✓</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '4px 20px 16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%', padding: '13px 0',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 12,
              color: TEXT2, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', letterSpacing: 0.5,
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirm Dialog ──────────────────────────────────────
function DeleteConfirmDialog({ catName, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 390,
      height: '100vh',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
    }}>
      <div style={{
        background: '#1E1E1E',
        borderRadius: 18,
        padding: 24,
        width: 320,
        textAlign: 'center',
      }}>
        <p style={{ color: TEXT, fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>
          Delete Category
        </p>
        <p style={{ color: TEXT2, fontSize: 14, margin: '0 0 20px' }}>
          Delete &ldquo;{catName}&rdquo;? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px 0',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              borderRadius: 10, color: TEXT2,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px 0',
              background: '#EF4444',
              border: 'none',
              borderRadius: 10, color: '#fff',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Sheet Row ──────────────────────────────────────────────────
function SheetRow({ icon, label, right, onPress, danger, divider = true }) {
  return (
    <>
      <button
        type="button"
        onClick={onPress}
        style={{
          display: 'flex', alignItems: 'center', gap: 14,
          width: '100%', padding: '15px 20px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', width: 22 }}>
          {icon}
        </span>
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: danger ? '#EF4444' : TEXT }}>
          {label}
        </span>
        {right && (
          <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {right}
          </span>
        )}
      </button>
      {divider && <div style={{ height: 1, background: BORDER, marginLeft: 54 }} />}
    </>
  )
}

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 4 }}>
      <div style={{
        width: 70, height: 70, borderRadius: 18,
        background: 'linear-gradient(90deg, #1a1a1a 25%, #242424 50%, #1a1a1a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
      }} />
      <div style={{ width: 48, height: 9, borderRadius: 5, background: '#1E1E1E' }} />
      <div style={{ width: 36, height: 8, borderRadius: 5, background: '#1A1A1A' }} />
    </div>
  )
}

// ── Main Screen ────────────────────────────────────────────────
export default function CategoriesScreen() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  // ── Data state ───────────────────────────────────────────
  const [customCats,  setCustomCats]  = useState([])
  const [defaultCats, setDefaultCats] = useState([])
  const [habits,           setHabits]           = useState([])
  const [tasks,            setTasks]            = useState([])
  const [loading,          setLoading]          = useState(true)

  // ── New category sheet ───────────────────────────────────
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [newName,      setNewName]      = useState('')
  const [newIcon,      setNewIcon]      = useState('📌')
  const [newColor,     setNewColor]     = useState(ACCENT)
  const [saving,       setSaving]       = useState(false)
  const [newNameError, setNewNameError] = useState(false)

  // ── Edit sheet (custom or default) ──────────────────────
  const [editSheet,  setEditSheet]  = useState(null) // { type: 'custom'|'default', cat }
  const [editName,   setEditName]   = useState('')
  const [editIcon,   setEditIcon]   = useState('')
  const [editColor,  setEditColor]  = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError,  setEditError]  = useState('')

  // ── Sub-pickers ──────────────────────────────────────────
  const [iconPickerFor,  setIconPickerFor]  = useState(null) // 'new' | 'edit'
  const [colorPickerFor, setColorPickerFor] = useState(null) // 'new' | 'edit'

  // ── Inline name input ────────────────────────────────────
  const [showInlineNameInput, setShowInlineNameInput] = useState(null) // 'new' | 'edit'

  // ── Delete confirm ───────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // ── Load ─────────────────────────────────────────────────
  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cats, habitsData, tasksData] = await Promise.all([
        categoriesService.getAll(),
        habitsService.getAll(),
        tasksService.getAll(),
      ])

      const allCats = Array.isArray(cats) ? cats : (cats?.categories || [])
      console.log(`CategoriesScreen: fetched ${allCats.length} total categories from API`)

      const DEFAULT_NAMES = new Set([
        'Spiritual', 'Quit a bad habit', 'Art', 'Meditation', 'Study',
        'Sports', 'Gym', 'Entertainment', 'Social', 'Finance', 'Health',
        'Running', 'Work', 'Nutrition', 'Home', 'Outdoor', 'Other',
      ])

      // Split by name — name is the source of truth, not is_default flag
      const apiCustom   = allCats.filter(c => !DEFAULT_NAMES.has(c.name))
      const apiDefaults = allCats.filter(c =>  DEFAULT_NAMES.has(c.name))

      apiCustom.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setCustomCats(apiCustom)

      // Always show all 17 hardcoded defaults; merge with API data if saved
      const merged = DEFAULT_CATEGORIES.map(hd => {
        const saved = apiDefaults.find(s => s.name === hd.name)
        return saved ? { ...hd, ...saved } : { ...hd, id: null, entry_count: 0 }
      })
      console.log(`CategoriesScreen: showing ${merged.length} default categories (${merged.filter(c => c.id).length} matched from DB)`)
      setDefaultCats(merged)

      const habitArr = Array.isArray(habitsData) ? habitsData : (habitsData?.habits || [])
      const taskArr  = Array.isArray(tasksData)  ? tasksData  : (tasksData?.tasks  || [])
      setHabits(habitArr)
      setTasks(taskArr)
    } catch (_) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  // ── Entry count ──────────────────────────────────────────
  function getEntryCount(categoryId) {
    if (!categoryId) return 0
    const hCount = habits.filter(h =>
      h.category_id === categoryId || h.categories?.id === categoryId
    ).length
    const tCount = tasks.filter(t =>
      t.category_id === categoryId || t.categories?.id === categoryId
    ).length
    return hCount + tCount
  }

  // ── Merged + sorted default categories ──────────────────
  function getDisplayedDefaults() {
    return [...defaultCats].sort((a, b) => {
      const ca = getEntryCount(a.id)
      const cb = getEntryCount(b.id)
      if (ca > 0 && cb === 0) return -1
      if (cb > 0 && ca === 0) return 1
      if (ca > 0 && cb > 0)   return cb - ca
      return a.name.localeCompare(b.name)
    })
  }

  // ── New category handlers ────────────────────────────────
  function openNewSheet() {
    setNewName(''); setNewIcon('📌'); setNewColor(ACCENT)
    setNewNameError(false)
    setShowNewSheet(true)
  }

  async function createCategory() {
    if (!newName.trim()) {
      setNewNameError(true)
      return
    }
    setSaving(true)
    try {
      const created = await categoriesService.create({
        name:  newName.trim(),
        icon:  newIcon,
        color: newColor,
      })
      if (created) setCustomCats(prev => [created, ...prev])
      setShowNewSheet(false)
    } catch (_) {
      // silent
    } finally {
      setSaving(false)
    }
  }

  // ── Custom category handlers ─────────────────────────────
  function openCustomEdit(cat) {
    setEditSheet({ type: 'custom', cat })
    setEditName(cat.name)
    setEditIcon(cat.icon  || '📌')
    setEditColor(cat.color || ACCENT)
    setEditError('')
  }

  async function saveCustomEdit() {
    if (!editSheet) return
    const { cat } = editSheet
    setEditSaving(true)
    setEditError('')
    try {
      await categoriesService.update(cat.id, {
        name:  editName.trim() || cat.name,
        icon:  editIcon,
        color: editColor,
      })
      setCustomCats(prev => prev.map(c =>
        c.id === cat.id
          ? { ...c, name: editName.trim() || cat.name, icon: editIcon, color: editColor }
          : c
      ))
      setEditSheet(null)
    } catch (_) {
      setEditError('Failed to save changes')
    } finally {
      setEditSaving(false)
    }
  }

  async function deleteCustomCat() {
    if (!editSheet) return
    const { cat } = editSheet
    try {
      await categoriesService.delete(cat.id)
      setCustomCats(prev => prev.filter(c => c.id !== cat.id))
      setEditSheet(null)
      setShowDeleteConfirm(false)
    } catch (_) {
      // silent
    }
  }

  // ── Default category handlers ────────────────────────────
  function openDefaultEdit(cat) {
    setEditSheet({ type: 'default', cat })
    setEditIcon(cat.icon  || '📌')
    setEditColor(cat.color || ACCENT)
    setEditError('')
  }

  async function saveDefaultEdit() {
    if (!editSheet) return
    const { cat } = editSheet
    setEditSaving(true)
    setEditError('')
    try {
      await categoriesService.update(cat.id, { icon: editIcon, color: editColor })
      setDefaultCats(prev => prev.map(c =>
        c.id === cat.id ? { ...c, icon: editIcon, color: editColor } : c
      ))
      setEditSheet(null)
    } catch (_) {
      setEditError('Failed to save changes')
    } finally {
      setEditSaving(false)
    }
  }

  async function deleteDefaultCat() {
    if (!editSheet) return
    const { cat } = editSheet
    try {
      await categoriesService.delete(cat.id)
      setDefaultCats(prev => prev.filter(c => c.id !== cat.id))
      setEditSheet(null)
      setShowDeleteConfirm(false)
    } catch (_) {
      // silent
    }
  }

  // ── Picker / dialog helpers ──────────────────────────────
  function handleIconSelect(icon) {
    if (iconPickerFor === 'new')  setNewIcon(icon)
    else                          setEditIcon(icon)
    setIconPickerFor(null)
  }

  function handleColorSelect(color) {
    if (colorPickerFor === 'new') setNewColor(color)
    else                          setEditColor(color)
    setColorPickerFor(null)
  }

  const displayedDefaults = getDisplayedDefaults()

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: 390,
      margin: '0 auto',
      position: 'relative',
      minHeight: '100vh',
      background: BG,
      overflow: 'hidden',
    }}>
    <div style={{ color: TEXT, paddingBottom: 150 }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '52px 16px 16px',
        position: 'sticky', top: 0, background: BG, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
          >
            <IconBack />
          </button>
          <span style={{ fontSize: 20, fontWeight: 700 }}>Categories</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
          >
            <IconMenu />
          </button>
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', display: 'flex' }}
          >
            <IconInfo />
          </button>
        </div>
      </div>
      <HamburgerMenu isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {/* ── Custom Categories ── */}
      <div style={{ padding: '4px 16px 0' }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: TEXT2,
          textTransform: 'uppercase', letterSpacing: 1,
          margin: '0 0 12px',
        }}>
          Custom categories
        </p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : customCats.length === 0 ? (
          <div style={{
            background: CARD, borderRadius: 14, padding: '28px 16px',
            border: `1px dashed ${BORDER}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: 4,
          }}>
            <span style={{ fontSize: 32, marginBottom: 8 }}>📂</span>
            <p style={{ color: TEXT2, fontSize: 13, textAlign: 'center', margin: 0 }}>
              No custom categories yet
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
          }}>
            {customCats.map(cat => (
              <CategoryCard
                key={cat.id}
                icon={cat.icon   || '📌'}
                color={cat.color || ACCENT}
                name={cat.name}
                entryCount={getEntryCount(cat.id)}
                onPress={() => openCustomEdit(cat)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Default Categories ── */}
      <div style={{ padding: '24px 0 0' }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: TEXT2,
          textTransform: 'uppercase', letterSpacing: 1,
          margin: '0 0 12px', paddingLeft: 16,
        }}>
          Default categories
        </p>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 6,
          padding: '0 16px 8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}>
          {loading
            ? Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ flexShrink: 0, width: 78, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: '#1A1A1A' }} />
                  <div style={{ width: 50, height: 8, borderRadius: 4, background: '#1A1A1A' }} />
                </div>
              ))
            : displayedDefaults.map(cat => (
                <DefaultCategoryCard
                  key={cat.id || cat.name}
                  icon={cat.icon   || '📌'}
                  color={cat.color || '#95A5A6'}
                  name={cat.name}
                  entryCount={getEntryCount(cat.id)}
                  onPress={() => openDefaultEdit(cat)}
                />
              ))
          }
        </div>
      </div>

      {/* ── NEW CATEGORY fixed button ── */}
      <div style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 390,
        padding: '0 16px',
        zIndex: 50,
        boxSizing: 'border-box',
      }}>
        <button
          type="button"
          onClick={openNewSheet}
          style={{
            width: '100%', padding: '15px 0',
            background: ACCENT, border: 'none',
            borderRadius: 14, color: '#fff',
            fontSize: 14, fontWeight: 700,
            letterSpacing: 1.2, cursor: 'pointer',
          }}
        >
          NEW CATEGORY
        </button>
      </div>

      {/* ── New Category Bottom Sheet ── */}
      {showNewSheet && (
        <>
          <Overlay onClose={() => setShowNewSheet(false)} />
          <div style={{
            position: 'fixed',
            bottom: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 390,
            backgroundColor: '#1A1A1A',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0px',
            paddingBottom: '40px',
            zIndex: 1000,
            maxHeight: '50vh',
            overflowY: 'auto',
            boxSizing: 'border-box',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT, flexShrink: 0 }} />
                <span style={{ fontSize: 16, fontWeight: 700 }}>New category</span>
              </div>
              {/* Icon preview */}
              <div style={{
                width: 46, height: 46, borderRadius: 13,
                background: newColor + '22',
                border: `2px solid ${newColor}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {newIcon}
              </div>
            </div>

            {/* Row 1: Name */}
            {showInlineNameInput === 'new' ? (
              <div style={{ padding: '12px 0 4px', borderBottom: `1px solid ${BORDER}` }}>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setNewNameError(false) }}
                  placeholder="Enter category name"
                  onKeyDown={e => { if (e.key === 'Enter') setShowInlineNameInput(null) }}
                  onBlur={() => setShowInlineNameInput(null)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: BG,
                    border: `1.5px solid ${ACCENT}`,
                    borderRadius: 10,
                    color: TEXT,
                    fontSize: 15,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ) : (
              <SheetRow
                icon={<IconPencil color={newNameError ? '#EF4444' : ACCENT} />}
                label={
                  <span style={{ color: newNameError ? '#EF4444' : TEXT }}>
                    Category name
                    {newNameError && <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 6 }}>required</span>}
                  </span>
                }
                right={newName
                  ? <span style={{ fontSize: 13, color: TEXT2, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{newName}</span>
                  : null
                }
                onPress={() => setShowInlineNameInput('new')}
              />
            )}

            {/* Row 2: Icon */}
            <SheetRow
              icon={<IconImage />}
              label="Category icon"
              right={<span style={{ fontSize: 26 }}>{newIcon}</span>}
              onPress={() => setIconPickerFor('new')}
            />

            {/* Row 3: Color */}
            <SheetRow
              icon={<IconContrast color={newColor} />}
              label="Category color"
              right={<div style={{ width: 24, height: 24, borderRadius: '50%', background: newColor }} />}
              onPress={() => setColorPickerFor('new')}
              divider={false}
            />

            {/* Create button */}
            {newNameError && (
              <p style={{
                color: '#EF4444', fontSize: 13, fontWeight: 500,
                margin: '8px 0 0', textAlign: 'center',
              }}>
                Category name is required
              </p>
            )}
            <button
              type="button"
              onClick={createCategory}
              disabled={saving}
              style={{
                marginTop: '24px',
                color: '#E8445A',
                fontWeight: 'bold',
                fontSize: '16px',
                textAlign: 'center',
                letterSpacing: '1px',
                padding: '16px',
                cursor: saving ? 'default' : 'pointer',
                width: '100%',
                background: 'none',
                border: 'none',
              }}
            >
              {saving ? 'CREATING...' : 'CREATE CATEGORY'}
            </button>
          </div>
        </>
      )}

      {/* ── Edit Sheet (custom or default) ── */}
      {editSheet && (
        <>
          <Overlay onClose={() => setEditSheet(null)} />
          <BottomSheet>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 20px 16px',
              borderBottom: `1px solid ${BORDER}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: editColor + '22',
                  border: `2px solid ${editColor}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {editIcon}
                </div>
                <span style={{ fontSize: 16, fontWeight: 700 }}>
                  {editSheet.type === 'custom' ? (editName || editSheet.cat.name) : editSheet.cat.name}
                </span>
              </div>
              <button
                type="button"
                onClick={editSheet.type === 'custom' ? saveCustomEdit : saveDefaultEdit}
                disabled={editSaving}
                style={{
                  background: 'none', border: 'none',
                  cursor: editSaving ? 'default' : 'pointer',
                  color: ACCENT, fontSize: 15, fontWeight: 700,
                  padding: '4px 8px', opacity: editSaving ? 0.5 : 1,
                }}
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
            </div>

            {/* Edit name (custom only) */}
            {editSheet.type === 'custom' && (
              showInlineNameInput === 'edit' ? (
                <div style={{ padding: '12px 20px 4px', borderBottom: `1px solid ${BORDER}` }}>
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Category name"
                    onKeyDown={e => { if (e.key === 'Enter') setShowInlineNameInput(null) }}
                    onBlur={() => setShowInlineNameInput(null)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      background: BG,
                      border: `1.5px solid ${ACCENT}`,
                      borderRadius: 10,
                      color: TEXT,
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ) : (
                <SheetRow
                  icon={<IconPencil />}
                  label="Edit name"
                  right={
                    <span style={{ fontSize: 13, color: TEXT2, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {editName}
                    </span>
                  }
                  onPress={() => setShowInlineNameInput('edit')}
                />
              )
            )}

            {/* Edit icon */}
            <SheetRow
              icon={<IconImage />}
              label="Edit icon"
              right={<span style={{ fontSize: 26 }}>{editIcon}</span>}
              onPress={() => setIconPickerFor('edit')}
            />

            {/* Edit color */}
            <SheetRow
              icon={<IconContrast color={editColor} />}
              label="Edit color"
              right={<div style={{ width: 24, height: 24, borderRadius: '50%', background: editColor }} />}
              onPress={() => setColorPickerFor('edit')}
            />

            {/* Delete */}
            <SheetRow
              icon={<IconTrash />}
              label="Delete category"
              onPress={() => setShowDeleteConfirm(true)}
              danger
              divider={false}
            />

            {/* Error */}
            {editError && (
              <div style={{ padding: '8px 20px 0', color: '#EF4444', fontSize: 13 }}>
                {editError}
              </div>
            )}

            {/* Save */}
            <div style={{ padding: '16px 20px 8px' }}>
              <button
                type="button"
                onClick={editSheet.type === 'custom' ? saveCustomEdit : saveDefaultEdit}
                disabled={editSaving}
                style={{
                  width: '100%', padding: '14px 0',
                  background: editSaving ? '#333' : ACCENT,
                  border: 'none', borderRadius: 12,
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: editSaving ? 'default' : 'pointer',
                  letterSpacing: 0.5,
                }}
              >
                {editSaving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </BottomSheet>
        </>
      )}

      {/* ── Icon Picker ── */}
      {iconPickerFor && (
        <IconPickerSheet
          selected={iconPickerFor === 'new' ? newIcon : editIcon}
          onSelect={handleIconSelect}
          onClose={() => setIconPickerFor(null)}
        />
      )}

      {/* ── Color Picker ── */}
      {colorPickerFor && (
        <ColorPickerSheet
          selected={colorPickerFor === 'new' ? newColor : editColor}
          onSelect={handleColorSelect}
          onClose={() => setColorPickerFor(null)}
        />
      )}

      {/* ── Delete Confirm ── */}
      {showDeleteConfirm && editSheet && (
        <DeleteConfirmDialog
          catName={editSheet.cat.name}
          onConfirm={editSheet.type === 'custom' ? deleteCustomCat : deleteDefaultCat}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

    </div>
    </div>
  )
}
