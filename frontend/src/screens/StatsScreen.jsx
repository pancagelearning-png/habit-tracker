import { useState, useEffect } from 'react'
import { habitsService } from '../services/habits'

const RANGES = [
  { label: '7d',  days: 7  },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 }
]

export default function StatsScreen() {
  const [range,   setRange]   = useState(30)
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    habitsService.getAllStats(range)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  const stats     = data?.stats || []
  const totalDays = data?.totalDays || range

  const avgRate = stats.length
    ? Math.round(stats.reduce((s, h) => s + h.rate, 0) / stats.length)
    : 0

  const bestHabit = stats.length
    ? stats.reduce((best, h) => h.rate > best.rate ? h : best, stats[0])
    : null

  return (
    <div className="screen">
      {/* Header */}
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.5px' }}>
        Statistics
      </h1>

      {/* Range selector */}
      <div style={{
        display: 'flex',
        background: '#1A1A1A',
        borderRadius: 14,
        padding: 4,
        marginBottom: 24,
        border: '1px solid #2A2A2A'
      }}>
        {RANGES.map(r => (
          <button
            key={r.days}
            onClick={() => setRange(r.days)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 11,
              background: range === r.days ? '#6C63FF' : 'transparent',
              color: range === r.days ? '#fff' : '#555',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 76 }} />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: '#1A1A1A',
          borderRadius: 20,
          border: '1px dashed #2A2A2A'
        }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📊</p>
          <p style={{ fontWeight: 600, fontSize: 15 }}>No habits yet</p>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Add habits to see your stats</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <SummaryCard
              label="Avg. Completion"
              value={`${avgRate}%`}
              sub={`Last ${totalDays} days`}
              color="#6C63FF"
            />
            <SummaryCard
              label="Total Habits"
              value={stats.length}
              sub="Active"
              color="#22C55E"
            />
            {bestHabit && (
              <SummaryCard
                label="Best Habit"
                value={`${bestHabit.rate}%`}
                sub={bestHabit.name}
                color={bestHabit.color || '#6C63FF'}
                span2={false}
              />
            )}
            <SummaryCard
              label="Days Tracked"
              value={totalDays}
              sub="days"
              color="#F59E0B"
            />
          </div>

          {/* Habit breakdown */}
          <p className="section-title" style={{ marginBottom: 16 }}>Habit Breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...stats].sort((a, b) => b.rate - a.rate).map(habit => (
              <HabitStatBar key={habit.id} habit={habit} totalDays={totalDays} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#1A1A1A',
      borderRadius: 18,
      padding: '18px',
      border: '1px solid #2A2A2A'
    }}>
      <p style={{ fontSize: 12, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.5px', marginBottom: 4 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {sub}
      </p>
    </div>
  )
}

function HabitStatBar({ habit, totalDays }) {
  const { name, color = '#6C63FF', completions, rate } = habit

  return (
    <div style={{
      background: '#1A1A1A',
      borderRadius: 16,
      padding: '16px',
      border: '1px solid #2A2A2A'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {rate}%
        </span>
      </div>

      {/* Bar */}
      <div style={{
        height: 6,
        background: '#2A2A2A',
        borderRadius: 99,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${rate}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.6s ease'
        }} />
      </div>

      <p style={{ fontSize: 11, color: '#555', marginTop: 8 }}>
        {completions} of {totalDays} days
      </p>
    </div>
  )
}
