import { useState, useEffect } from 'react'
import { habitsService } from '../services/habits'
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  formatMonth,
  toISODate
} from '../utils/helpers'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const STATUS_BUTTONS = [
  { status: 'completed',     emoji: '✅', label: 'Completed', color: '#22C55E' },
  { status: 'not_completed', emoji: '⏸', label: 'Pending',   color: '#F59E0B' },
  { status: 'missed',        emoji: '❌', label: 'Missed',    color: '#EF4444' },
]

export default function CalendarScreen() {
  const now    = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [logs,  setLogs]  = useState([]) // all completed dates as Set
  const [habits,setHabits]= useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedDateHabits, setSelectedDateHabits] = useState([])
  const [loadingDateHabits, setLoadingDateHabits] = useState(false)
  const [dateLogStatuses, setDateLogStatuses] = useState({}) // { [habit_id]: status }
  const [loggingHabit, setLoggingHabit] = useState(null)

  useEffect(() => {
    habitsService.getAll().then(data => setHabits(data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchLogs() {
      if (!habits.length) return
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
      try {
        const results = await Promise.all(
          habits.map(h => habitsService.getLogs(h.id, monthStr))
        )
        const allDates = results.flat().map(l => l.completed_at)
        setLogs(allDates)
      } catch {}
    }
    fetchLogs()
  }, [year, month, habits])

  useEffect(() => {
    if (!selectedDay) {
      setSelectedDateHabits([])
      setDateLogStatuses({})
      return
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    setLoadingDateHabits(true)
    setDateLogStatuses({})
    Promise.all([
      habitsService.getByDate(dateStr),
      habitsService.getLogsByDate(dateStr)
    ])
      .then(([habitsData, logsData]) => {
        setSelectedDateHabits(habitsData || [])
        const statuses = {}
        ;(logsData || []).forEach(log => {
          statuses[log.habit_id] = log.status
        })
        setDateLogStatuses(statuses)
      })
      .catch(() => setSelectedDateHabits([]))
      .finally(() => setLoadingDateHabits(false))
  }, [selectedDay, year, month])

  async function handleLogHabit(habit_id, status, log_date) {
    setLoggingHabit(habit_id)
    try {
      await habitsService.log(habit_id, { log_date, status })
      setDateLogStatuses(prev => ({ ...prev, [habit_id]: status }))
    } catch {}
    finally {
      setLoggingHabit(null)
    }
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0);  setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDayOfWk = getFirstDayOfMonth(year, month)
  const today        = toISODate()

  // Count completions per day
  const countByDay = {}
  logs.forEach(date => {
    const d = parseInt(date.split('-')[2])
    countByDay[d] = (countByDay[d] || 0) + 1
  })

  return (
    <div className="screen">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Calendar</h1>
      </div>

      {/* Month nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        background: '#1A1A1A',
        borderRadius: 16,
        padding: '12px 16px'
      }}>
        <button onClick={prevMonth} style={{ background: 'none', padding: 6, borderRadius: 8, color: '#888' }}>
          <ChevronLeft />
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{formatMonth(year, month)}</span>
        <button onClick={nextMonth} style={{ background: 'none', padding: 6, borderRadius: 8, color: '#888' }}>
          <ChevronRight />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#555', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: firstDayOfWk }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const count   = countByDay[day] || 0
          const isToday = dateStr === today
          const isFuture = dateStr > today
          const isSelected = selectedDay === day
          const hasDone  = count > 0

          return (
            <button
              key={day}
              onClick={() => !isFuture && setSelectedDay(isSelected ? null : day)}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected
                  ? '#6C63FF'
                  : isToday
                    ? 'rgba(108,99,255,0.15)'
                    : hasDone
                      ? 'rgba(34,197,94,0.12)'
                      : 'transparent',
                border: isToday && !isSelected ? '1.5px solid #6C63FF' : '1.5px solid transparent',
                color: isSelected ? '#fff' : isFuture ? '#333' : '#fff',
                fontSize: 13,
                fontWeight: isToday ? 700 : 400,
                cursor: isFuture ? 'default' : 'pointer',
                gap: 2,
                padding: 2
              }}
            >
              {day}
              {hasDone && !isFuture && (
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: isSelected ? '#fff' : '#22C55E'
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div style={{ marginTop: 24 }}>
          <p className="section-title" style={{ marginBottom: 12 }}>
            {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {loadingDateHabits ? (
            <div style={{ padding: '24px', background: '#1A1A1A', borderRadius: 16, textAlign: 'center', color: '#555', fontSize: 14 }}>
              Loading...
            </div>
          ) : selectedDateHabits.length === 0 ? (
            <div style={{
              padding: '24px',
              background: '#1A1A1A',
              borderRadius: 16,
              textAlign: 'center',
              color: '#555',
              fontSize: 14
            }}>
              No habits scheduled for this day
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedDateHabits.map(habit => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
                const currentStatus = dateLogStatuses[habit.id]
                const isLogging = loggingHabit === habit.id
                return (
                  <div key={habit.id} style={{
                    background: '#1A1A1A',
                    borderRadius: 14,
                    padding: '12px 16px',
                    border: '1px solid #2A2A2A',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: habit.color || '#6C63FF',
                      flexShrink: 0
                    }} />
                    <span style={{ fontSize: 14, color: '#fff', flex: 1 }}>{habit.name}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {STATUS_BUTTONS.map(({ status, emoji, label, color }) => {
                        const isSelected = currentStatus === status
                        return (
                          <button
                            key={status}
                            title={label}
                            onClick={() => handleLogHabit(habit.id, status, dateStr)}
                            disabled={isLogging}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                              background: isSelected ? `${color}22` : '#2A2A2A',
                              cursor: isLogging ? 'default' : 'pointer',
                              fontSize: 15,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: isLogging ? 0.5 : 1,
                              transition: 'background 0.15s, border 0.15s'
                            }}
                          >
                            {emoji}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <LegendItem color="#22C55E" opacity={0.12} label="Completed" />
        <LegendItem color="#6C63FF" opacity={0.15} label="Today" bordered />
      </div>
    </div>
  )
}

function LegendItem({ color, opacity, label, bordered }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 16,
        height: 16,
        borderRadius: 5,
        background: `rgba(${color === '#22C55E' ? '34,197,94' : '108,99,255'},${opacity})`,
        border: bordered ? `1.5px solid ${color}` : 'none'
      }} />
      <span style={{ fontSize: 12, color: '#555' }}>{label}</span>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}
