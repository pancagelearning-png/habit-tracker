import { useNavigate, useLocation } from 'react-router-dom'

const ACCENT = '#E8445A'
const GREY   = '#555555'
const BG_NAV = '#111111'

// ── Icons ────────────────────────────────────────────────────
function IconToday({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
}

function IconHabits({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="M7 23l-4-4 4-4"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  )
}

function IconTasks({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8"  y1="6"  x2="21" y2="6"/>
      <line x1="8"  y1="12" x2="21" y2="12"/>
      <line x1="8"  y1="18" x2="21" y2="18"/>
      <line x1="3"  y1="6"  x2="3.01" y2="6"/>
      <line x1="3"  y1="12" x2="3.01" y2="12"/>
      <line x1="3"  y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function IconCategories({ color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3"  y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="3"  width="7" height="7" rx="1"/>
      <rect x="3"  y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  )
}

// ── Nav config ───────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/today',      label: 'Today',      Icon: IconToday      },
  { path: '/habits',     label: 'Habits',     Icon: IconHabits     },
  { path: '/tasks',      label: 'Tasks',      Icon: IconTasks      },
  { path: '/categories', label: 'Categories', Icon: IconCategories },
]

// ── Component ────────────────────────────────────────────────
export default function BottomNavbar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '390px',
      background: BG_NAV,
      borderTop: '1px solid #2A2A2A',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '10px 4px 24px',
      zIndex: 100,
    }}>
      {NAV_ITEMS.map(({ path, label, Icon }) => {
        const active = pathname === path
        const color  = active ? ACCENT : GREY

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'transparent',
              padding: '4px 8px',
              borderRadius: 10,
              flex: 1,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Icon color={color} />
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              color,
              transition: 'color 0.2s',
            }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
