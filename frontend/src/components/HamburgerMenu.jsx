import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabaseClient'

const ACCENT = '#E8445A'
const TEXT   = '#FFFFFF'
const TEXT2  = '#888888'
const BORDER = '#2A2A2A'
const BG     = '#1A1A1A'

function formatToday() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

// ── Icons ────────────────────────────────────────────────────
function IconPerson() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

// ── Menu Row ─────────────────────────────────────────────────
function MenuRow({ icon, label, danger, onPress, noChevron }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        width: '100%',
        padding: '16px 20px',
        background: 'transparent',
        border: 'none',
        cursor: onPress ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <span style={{ flexShrink: 0, width: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <span style={{
        flex: 1,
        fontSize: 15,
        fontWeight: 500,
        color: danger ? ACCENT : TEXT,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      {!noChevron && onPress && <IconChevron />}
    </button>
  )
}

// ── Divider ──────────────────────────────────────────────────
function Divider({ indent = false }) {
  return <div style={{ height: 1, background: BORDER, marginLeft: indent ? 54 : 0 }} />
}

// ── Input ────────────────────────────────────────────────────
function PwInput({ placeholder, value, onChange }) {
  return (
    <input
      type="password"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        background: '#111',
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: '13px 14px',
        fontSize: 14,
        color: TEXT,
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
  )
}

// ── Main Component ───────────────────────────────────────────
export default function HamburgerMenu({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showPasswordSheet, setShowPasswordSheet] = useState(false)
  const [showSupportModal,  setShowSupportModal]  = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Password form state
  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwError,   setPwError]   = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // Reset sub-sheets when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowPasswordSheet(false)
      setShowSupportModal(false)
      setShowLogoutConfirm(false)
      setPwError('')
      setPwSuccess(false)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    }
  }, [isOpen])

  async function handleChangePassword() {
    if (!newPw || !confirmPw) { setPwError('All fields are required'); return }
    if (newPw !== confirmPw)  { setPwError('Passwords do not match'); return }
    if (newPw.length < 6)    { setPwError('Password must be at least 6 characters'); return }
    setPwLoading(true)
    setPwError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/v1/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPw })
      })
      if (response.ok) {
        setPwSuccess(true)
        setNewPw(''); setConfirmPw('')
        setTimeout(() => setShowPasswordSheet(false), 1500)
      } else {
        const data = await response.json()
        setPwError(data.error)
      }
    } catch (err) {
      setPwError(err.message || 'Failed to update password')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    window.location.href = '/login'
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 998,
          display: isOpen ? 'block' : 'none',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '75%',
        maxWidth: '300px',
        backgroundColor: BG,
        zIndex: 999,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto',
        padding: '40px 20px 20px',
      }}>

          {/* App name + date */}
          <div style={{ marginBottom: 4 }}>
            <h1 style={{
              background: 'linear-gradient(135deg, #E8445A 0%, #FF6B6B 50%, #FF4ECD 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: '24px',
              fontWeight: 'bold',
              margin: 0,
            }}>TrackYourHabit</h1>
            <p style={{ fontSize: 13, color: TEXT2, margin: 0 }}>{formatToday()}</p>
          </div>

          <Divider />

          {/* Account section */}
          <MenuRow
            icon={<IconPerson />}
            label={user?.email || 'Account'}
            noChevron
          />
          <Divider indent />
          <MenuRow
            icon={<IconLock />}
            label="Change Password"
            onPress={() => { setPwSuccess(false); setShowPasswordSheet(true) }}
          />
          <Divider indent />
          <MenuRow
            icon={<IconLogout />}
            label="Log Out"
            danger
            onPress={() => setShowLogoutConfirm(true)}
          />

          <Divider />

          {/* Support section */}
          <MenuRow
            icon={<IconMail />}
            label="Contact Support"
            onPress={() => setShowSupportModal(true)}
          />
        </div>

        {/* ── Change Password Bottom Sheet ── */}
        {showPasswordSheet && (
          <>
            <div
              onClick={() => setShowPasswordSheet(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100 }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 390,
              background: '#1E1E1E',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              padding: '24px 20px 40px',
              zIndex: 1101,
            }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#444', margin: '0 auto 20px' }} />
              <p style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: '0 0 20px' }}>Change Password</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <PwInput placeholder="New Password"         value={newPw}     onChange={setNewPw} />
                <PwInput placeholder="Confirm New Password" value={confirmPw} onChange={setConfirmPw} />
              </div>

              {pwError && (
                <p style={{ fontSize: 13, color: ACCENT, margin: '12px 0 0', textAlign: 'center' }}>{pwError}</p>
              )}
              {pwSuccess && (
                <p style={{ fontSize: 13, color: '#4CAF50', margin: '12px 0 0', textAlign: 'center' }}>Password updated successfully!</p>
              )}

              <button
                type="button"
                onClick={handleChangePassword}
                disabled={pwLoading}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '14px 0',
                  background: pwLoading ? '#555' : ACCENT,
                  border: 'none',
                  borderRadius: 14,
                  color: '#fff',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                  letterSpacing: 0.5,
                }}
              >
                {pwLoading ? 'UPDATING…' : 'UPDATE PASSWORD'}
              </button>
            </div>
          </>
        )}

        {/* ── Logout Confirm Dialog ── */}
        {showLogoutConfirm && (
          <>
            <div
              onClick={() => setShowLogoutConfirm(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100 }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 280,
              background: '#1E1E1E',
              borderRadius: 18,
              padding: '24px 20px',
              zIndex: 1101,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>Log Out</p>
              <p style={{ fontSize: 14, color: TEXT2, margin: '0 0 24px', lineHeight: 1.5 }}>
                Are you sure you want to log out?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: 'transparent',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12, color: TEXT2,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    flex: 1, padding: '12px 0',
                    background: ACCENT,
                    border: 'none',
                    borderRadius: 12, color: '#fff',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Contact Support Modal ── */}
        {showSupportModal && (
          <>
            <div
              onClick={() => setShowSupportModal(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100 }}
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 280,
              background: '#1E1E1E',
              borderRadius: 18,
              padding: '24px 20px',
              zIndex: 1101,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: '0 0 12px' }}>Contact Support</p>
              <p style={{ fontSize: 14, color: TEXT2, margin: '0 0 8px', lineHeight: 1.5 }}>
                Your feedback is very valuable to us.
              </p>
              <p style={{ fontSize: 14, color: TEXT2, margin: '0 0 12px', lineHeight: 1.5 }}>
                Please send an email to:
              </p>
              <a
                href="mailto:pancage236@gmail.com"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: ACCENT,
                  textDecoration: 'none',
                  display: 'block',
                  marginBottom: 20,
                }}
              >
                pancage236@gmail.com
              </a>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                style={{
                  width: '100%', padding: '12px 0',
                  background: 'transparent',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 12, color: TEXT2,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
    </>
  )
}
