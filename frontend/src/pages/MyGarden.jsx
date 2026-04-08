import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGardenContext } from '../context/GardenContext'
import { STAGES, estimateHarvest, daysUntilHarvest, getWateringStatus } from '../hooks/useGarden'

const STAGE_LABELS = {
  planning:    { label: 'Planning',     emoji: '📋', color: '#a0aec0' },
  sown:        { label: 'Sown',         emoji: '🌰', color: '#ed8936' },
  germinated:  { label: 'Germinated',   emoji: '🌱', color: '#68d391' },
  transplanted:{ label: 'Transplanted', emoji: '🪴', color: '#4299e1' },
  fruiting:    { label: 'Fruiting',     emoji: '🌸', color: '#9f7aea' },
  harvested:   { label: 'Harvested',    emoji: '🍽️', color: '#52b788' },
}

function HarvestBadge({ entry }) {
  const days = daysUntilHarvest(entry)
  if (days === null) return null
  if (entry.stage === 'harvested') return <span className="garden-badge harvested-badge">✅ Harvested</span>
  if (days < 0) return <span className="garden-badge overdue-badge">⏰ Harvest overdue by {Math.abs(days)}d</span>
  if (days <= 14) return <span className="garden-badge soon-badge">🍽️ Ready in {days}d</span>
  const h = estimateHarvest(entry)
  return (
    <span className="garden-badge estimate-badge">
      📅 Est. {h.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
    </span>
  )
}

function WateringBadge({ entry, onWater }) {
  const status = getWateringStatus(entry)
  if (!status) return null
  return (
    <button
      className={`watering-badge ${status.urgent ? 'watering-urgent' : 'watering-ok'}`}
      onClick={e => { e.preventDefault(); e.stopPropagation(); onWater() }}
      title="Click to mark as watered"
    >
      💧 {status.label}
    </button>
  )
}

function StageProgress({ stage, onStageClick }) {
  const currentIdx = STAGES.indexOf(stage)
  return (
    <div className="stage-progress">
      {STAGES.map((s, i) => {
        const meta = STAGE_LABELS[s]
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <button
            key={s}
            className={`stage-dot ${done ? 'stage-done' : ''} ${active ? 'stage-active' : ''}`}
            style={active ? { background: meta.color, borderColor: meta.color } : {}}
            onClick={() => onStageClick(s)}
            title={meta.label}
          >
            {active && <span className="stage-dot-emoji">{meta.emoji}</span>}
          </button>
        )
      })}
      <span className="stage-label" style={{ color: STAGE_LABELS[stage].color }}>
        {STAGE_LABELS[stage].emoji} {STAGE_LABELS[stage].label}
      </span>
    </div>
  )
}

function JournalSection({ entry, onAdd }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const journal = entry.journal || []

  function submit() {
    if (!text.trim()) return
    onAdd(entry.plantId, text.trim())
    setText('')
    setOpen(false)
  }

  return (
    <div className="journal-section">
      <button className="journal-toggle" onClick={() => setOpen(o => !o)}>
        📓 Journal {journal.length > 0 ? `(${journal.length})` : ''} {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="journal-body">
          {journal.length === 0 && <p className="journal-empty">No entries yet.</p>}
          {journal.map((j, i) => (
            <div key={i} className="journal-entry">
              <span className="journal-date">{j.date}</span>
              <span className="journal-text">{j.text}</span>
            </div>
          ))}
          <div className="journal-add">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }}
              placeholder="e.g. First sprout appeared!"
              className="garden-notes-input"
              autoFocus
            />
            <button className="garden-notes-save" onClick={submit}>Add</button>
          </div>
        </div>
      )}
    </div>
  )
}

function GardenCard({ entry }) {
  const { removePlant, updateStage, updateNotes, markWatered, addJournalEntry } = useGardenContext()
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesVal, setNotesVal] = useState(entry.notes || '')
  const [confirmRemove, setConfirmRemove] = useState(false)

  function saveNotes() {
    updateNotes(entry.plantId, notesVal)
    setEditingNotes(false)
  }

  return (
    <div className={`garden-card ${entry.stage === 'harvested' ? 'garden-card-harvested' : ''}`}>
      {/* Header */}
      <div className="garden-card-header">
        <span className="garden-card-emoji">{entry.emoji}</span>
        <div className="garden-card-title">
          <Link to={`/plants/${entry.plantId}`} className="garden-card-name">
            {entry.plantName}
          </Link>
          <span className="garden-card-category">{entry.category}</span>
        </div>
        <div className="garden-card-actions">
          <HarvestBadge entry={entry} />
          {confirmRemove ? (
            <div className="garden-confirm-remove">
              <span>Remove?</span>
              <button className="garden-remove-yes" onClick={() => removePlant(entry.plantId)}>Yes</button>
              <button className="garden-remove-no" onClick={() => setConfirmRemove(false)}>No</button>
            </div>
          ) : (
            <button className="garden-remove-btn" onClick={() => setConfirmRemove(true)} title="Remove from garden">✕</button>
          )}
        </div>
      </div>

      {/* Stage progress */}
      <StageProgress stage={entry.stage} onStageClick={(s) => updateStage(entry.plantId, s)} />

      {/* Meta row */}
      <div className="garden-card-meta">
        <span>📆 Started {new Date(entry.dateStarted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        {entry.temp_min < 0 && <span className="garden-frost-ok">❄️ Frost tolerant</span>}
      </div>

      {/* Watering */}
      <WateringBadge entry={entry} onWater={() => markWatered(entry.plantId)} />

      {/* Notes */}
      <div className="garden-notes">
        {editingNotes ? (
          <div className="garden-notes-edit">
            <input
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveNotes(); if (e.key === 'Escape') setEditingNotes(false) }}
              placeholder="Add a note..."
              className="garden-notes-input"
              autoFocus
            />
            <button className="garden-notes-save" onClick={saveNotes}>Save</button>
            <button className="garden-notes-cancel" onClick={() => setEditingNotes(false)}>✕</button>
          </div>
        ) : (
          <button className="garden-notes-btn" onClick={() => setEditingNotes(true)}>
            {entry.notes ? `📝 ${entry.notes}` : '+ Add note'}
          </button>
        )}
      </div>

      {/* Journal */}
      <JournalSection entry={entry} onAdd={addJournalEntry} />
    </div>
  )
}

// Modal for adding a plant
function AddModal({ plant, onAdd, onClose }) {
  const [stage, setStage] = useState('planning')
  const [notes, setNotes] = useState('')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <span className="modal-emoji">{plant.emoji}</span>
          <div>
            <h3>Add {plant.name} to My Garden</h3>
            <p className="modal-sci">{plant.scientific_name}</p>
          </div>
        </div>

        <label className="modal-label">Current stage:</label>
        <div className="modal-stages">
          {STAGES.map(s => {
            const meta = STAGE_LABELS[s]
            return (
              <button
                key={s}
                className={`modal-stage-btn ${stage === s ? 'modal-stage-active' : ''}`}
                style={stage === s ? { background: meta.color, borderColor: meta.color } : {}}
                onClick={() => setStage(s)}
              >
                {meta.emoji} {meta.label}
              </button>
            )
          })}
        </div>

        <label className="modal-label">Notes (optional):</label>
        <input
          className="modal-notes-input"
          placeholder="e.g. south windowsill, pot on balcony..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <button
          className="modal-add-btn"
          onClick={() => { onAdd(stage, notes); onClose() }}
        >
          🪴 Add to My Garden
        </button>
      </div>
    </div>
  )
}

export { AddModal }

function exportGardenPDF(entries) {
  const win = window.open('', '_blank')
  const rows = entries.map(e => {
    const stage = STAGE_LABELS[e.stage]
    const journal = (e.journal || []).map(j => `<li>${j.date}: ${j.text}</li>`).join('') || '<li>No entries</li>'
    return `
      <div class="card">
        <div class="card-header">
          <span class="emoji">${e.emoji}</span>
          <div>
            <h2>${e.plantName}</h2>
            <p class="meta">${e.category} · Started ${e.dateStarted}</p>
          </div>
          <span class="stage" style="background:${stage.color}">${stage.emoji} ${stage.label}</span>
        </div>
        ${e.notes ? `<p class="notes">📝 ${e.notes}</p>` : ''}
        <div class="journal-section">
          <strong>📓 Journal</strong>
          <ul>${journal}</ul>
        </div>
      </div>
    `
  }).join('')

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>My Garden — Plan-t Ahead</title>
  <style>
    body { font-family: sans-serif; padding: 32px; color: #1a2e22; background: #f0f7f1; }
    h1 { color: #2d6a4f; margin-bottom: 8px; }
    .subtitle { color: #6b8f71; margin-bottom: 32px; font-size: 0.9rem; }
    .card { background: #fff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #b7e4c7; page-break-inside: avoid; }
    .card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
    .emoji { font-size: 2.4rem; }
    h2 { margin: 0; font-size: 1.1rem; }
    .meta { color: #6b8f71; font-size: 0.82rem; }
    .stage { padding: 4px 12px; border-radius: 20px; color: #fff; font-size: 0.8rem; font-weight: 700; margin-left: auto; }
    .notes { background: #f9fafb; border-left: 3px solid #52b788; padding: 6px 12px; border-radius: 4px; font-size: 0.85rem; margin-bottom: 8px; }
    .journal-section strong { font-size: 0.85rem; }
    ul { margin: 6px 0 0 16px; font-size: 0.82rem; color: #374c40; }
    @media print { body { background: #fff; } }
  </style>
</head>
<body>
  <h1>🪴 My Garden</h1>
  <p class="subtitle">Exported on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${entries.length} plant${entries.length !== 1 ? 's' : ''}</p>
  ${rows}
  <script>window.onload = () => window.print()</script>
</body>
</html>`)
  win.document.close()
}

export default function MyGarden() {
  const { entries, addPlant } = useGardenContext()

  const stats = {
    total: entries.length,
    growing: entries.filter(e => !['planning', 'harvested'].includes(e.stage)).length,
    readySoon: entries.filter(e => { const d = daysUntilHarvest(e); return d !== null && d <= 14 && d >= 0 }).length,
    harvested: entries.filter(e => e.stage === 'harvested').length,
  }

  const active = entries.filter(e => e.stage !== 'harvested')
  const harvested = entries.filter(e => e.stage === 'harvested')

  if (entries.length === 0) {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-inner">
            <h1>🪴 My Garden</h1>
            <p>Track your plants from seed to harvest. Add plants from any plant detail page.</p>
          </div>
        </div>
        <div className="garden-empty">
          <span className="garden-empty-icon">🌱</span>
          <h2>Your garden is empty</h2>
          <p>Browse the plant encyclopedia and click <strong>"Add to My Garden"</strong> on any plant to start tracking it.</p>
          <Link to="/plants" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
            🌿 Browse Plants
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <h1>🪴 My Garden</h1>
          <p>Track your plants from seed to harvest.</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">In Garden</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.growing}</span>
          <span className="stat-label">Growing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number" style={{ color: '#52b788' }}>{stats.readySoon}</span>
          <span className="stat-label">Ready Soon</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.harvested}</span>
          <span className="stat-label">Harvested</span>
        </div>
        <button className="pdf-export-btn" onClick={() => exportGardenPDF(entries)}>
          📄 Export PDF
        </button>
      </div>

      <div className="garden-page">
        {/* Stage legend */}
        <div className="garden-legend">
          {STAGES.map(s => (
            <div key={s} className="garden-legend-item">
              <span className="garden-legend-dot" style={{ background: STAGE_LABELS[s].color }} />
              <span>{STAGE_LABELS[s].emoji} {STAGE_LABELS[s].label}</span>
            </div>
          ))}
          <p className="garden-legend-hint">Click any stage dot on a card to update it</p>
        </div>

        {/* Active plants */}
        {active.length > 0 && (
          <section className="garden-section">
            <h2 className="garden-section-title">🌱 Currently Growing ({active.length})</h2>
            <div className="garden-grid">
              {active.map(e => <GardenCard key={e.plantId} entry={e} />)}
            </div>
          </section>
        )}

        {/* Harvested */}
        {harvested.length > 0 && (
          <section className="garden-section">
            <h2 className="garden-section-title">✅ Harvested ({harvested.length})</h2>
            <div className="garden-grid">
              {harvested.map(e => <GardenCard key={e.plantId} entry={e} />)}
            </div>
          </section>
        )}

        <div className="garden-footer-tip">
          <span>💡 Tip: Click any stage dot to advance the growth stage. Click 💧 to log a watering.</span>
        </div>
      </div>
    </div>
  )
}
