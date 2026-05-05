import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { habitsService }     from '../services/habits'
import { categoriesService } from '../services/categories'

export default function ProfileScreen() {
  const { logout }   = useAuth()
  const navigate     = useNavigate()
  const user         = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats,      setStats]    = useState(null)
  const [categories, setCategories] = useState([])
  const [catName,    setCatName]   = useState('')
  const [catColor,   setCatColor]  = useState('#6C63FF')
  const [addingCat,  setAddingCat] = useState(false)
  const [catLoading, setCatLoading]= useState(false)

  useEffect(() => {
    habitsService.getAllStats(30).then(setStats).catch(() => {})
    categoriesService.getAll().then(setCategories).catch(() => {})
  }, [])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!catName.trim()) return
    setCatLoading(true)
    try {
      const cat = await categoriesService.create({ name: catName.trim(), color: catColor })
      setCategories(prev => [...prev, cat])
      setCatName('')
      setAddingCat(false)
    } catch {}
    finally { setCatLoading(false) }
  }

  async function handleDeleteCategory(id) {
    try {
      await categoriesService.delete(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="screen">
      {/* Avatar + name */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36, paddingTop: 8 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 16,
          boxShadow: '0 8px 32px rgba(108,99,255,0.3)'
        }}>
          {initials}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user.name}</h2>
        <p style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{user.email}</p>
      </div>

      {/* Stats summary */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10,
          marginBottom: 28
        }}>
          <StatTile label="Habits" value={stats.stats?.length || 0} />
          <StatTile
            label="Avg Rate"
            value={stats.stats?.length
              ? `${Math.round(stats.stats.reduce((s,h)=>s+h.rate,0) / stats.stats.length)}%`
              : '—'}
          />
          <StatTile label="Days" value={stats.totalDays} />
        </div>
      )}

      {/* Categories */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p className="section-title" style={{ margin: 0 }}>Categories</p>
          <button
            onClick={() => setAddingCat(v => !v)}
            style={{
              background: addingCat ? '#2A2A2A' : 'rgba(108,99,255,0.15)',
              color: '#6C63FF',
              borderRadius: 10,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600
            }}
          >
            {addingCat ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {addingCat && (
          <form onSubmit={handleAddCategory} style={{ marginBottom: 14, display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Category name"
              value={catName}
              onChange={e => setCatName(e.target.value)}
              required
              style={{ flex: 1, borderRadius: 12, padding: '12px 14px', fontSize: 14 }}
            />
            <input
              type="color"
              value={catColor}
              onChange={e => setCatColor(e.target.value)}
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                border: '1px solid #2A2A2A',
                background: '#1A1A1A',
                cursor: 'pointer',
                padding: 4
              }}
            />
            <button
              type="submit"
              disabled={catLoading}
              style={{
                background: '#6C63FF',
                color: '#fff',
                borderRadius: 12,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Add
            </button>
          </form>
        )}

        {categories.length === 0 ? (
          <p style={{ color: '#444', fontSize: 14, textAlign: 'center', padding: '16px 0' }}>
            No categories yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map(cat => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#1A1A1A',
                  borderRadius: 14,
                  border: '1px solid #2A2A2A'
                }}
              >
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: cat.color || '#6C63FF',
                  flexShrink: 0
                }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  style={{ background: 'none', color: '#444', padding: 4, borderRadius: 8 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member since */}
      {user.created_at && (
        <p style={{ color: '#444', fontSize: 12, textAlign: 'center', marginBottom: 28 }}>
          Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: 14,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#EF4444',
          fontSize: 15,
          fontWeight: 600
        }}
      >
        Sign Out
      </button>
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div style={{
      background: '#1A1A1A',
      borderRadius: 16,
      padding: '14px 12px',
      textAlign: 'center',
      border: '1px solid #2A2A2A'
    }}>
      <p style={{ fontSize: 22, fontWeight: 700, color: '#6C63FF' }}>{value}</p>
      <p style={{ fontSize: 11, color: '#555', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  )
}
