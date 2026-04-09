import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const difficultyColors = { easy: '#52b788', medium: '#f4a261', hard: '#e76f51' }
const waterIcons = { Low: '💧', Moderate: '💧💧', High: '💧💧💧' }

const SUGGESTIONS = [
  'Cilantro', 'Rosemary', 'Jasmine', 'Fig', 'Spinach',
  'Turmeric', 'Papaya', 'Watermelon', 'Mint', 'Ginger',
]

function PlantPreviewCard({ plant, isNew }) {
  return (
    <div className="ai-result-card">
      {isNew && <div className="ai-new-badge">✨ Added to Plan-t Ahead</div>}

      <div className="ai-card-hero">
        <span className="ai-card-emoji">{plant.emoji}</span>
        <div className="ai-card-hero-info">
          <h3>{plant.name}</h3>
          <p className="ai-card-sci">{plant.scientific_name}</p>
          <div className="ai-card-badges">
            <span className="badge category">{plant.category}</span>
            <span
              className="badge difficulty"
              style={{ background: difficultyColors[plant.difficulty] || '#888' }}
            >
              {plant.difficulty}
            </span>
            {plant.is_indoor_capable && (
              <span className="badge" style={{ background: '#fff3cd', color: '#856404' }}>
                🏡 Indoor OK
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="ai-card-desc">{plant.description}</p>

      {/* Key stats strip */}
      <div className="ai-card-stats">
        <div className="ai-stat">
          <span>🌡️</span>
          <span>{plant.temp_optimal}°C optimal</span>
        </div>
        <div className="ai-stat">
          <span>☀️</span>
          <span>{plant.sunlight}</span>
        </div>
        <div className="ai-stat">
          <span>{waterIcons[plant.water_needs] || '💧'}</span>
          <span>{plant.water_needs} water</span>
        </div>
        <div className="ai-stat">
          <span>🌱</span>
          <span>{plant.germination_weeks_min}–{plant.germination_weeks_max}w to germinate</span>
        </div>
        <div className="ai-stat">
          <span>🧪</span>
          <span>pH {plant.soil_ph_min}–{plant.soil_ph_max}</span>
        </div>
        <div className="ai-stat">
          <span>🌿</span>
          <span>{plant.propagation_method}</span>
        </div>
      </div>

      {/* Regions */}
      {plant.regions?.length > 0 && (
        <div className="ai-card-regions">
          <span className="ai-section-label">Grows in:</span>
          <div className="ai-region-tags">
            {plant.regions.map(r => (
              <Link key={r.id} to={`/regions/${r.id}`} className="tag">{r.name}</Link>
            ))}
          </div>
        </div>
      )}

      {/* Companions preview */}
      {plant.companions?.length > 0 && (
        <div className="ai-card-companions">
          <span className="ai-section-label">🤝 Good companions:</span>
          <div className="ai-companion-pills">
            {plant.companions.slice(0, 3).map((c, i) => (
              <span key={i} className="ai-companion-pill friend">{c.name}</span>
            ))}
            {plant.foes?.slice(0, 2).map((f, i) => (
              <span key={i} className="ai-companion-pill foe">✗ {f.name}</span>
            ))}
          </div>
        </div>
      )}

      <Link to={`/plants/${plant.id}`} className="ai-view-btn">
        View Full Plant Profile →
      </Link>
    </div>
  )
}

export default function PlantAISearch({ onPlantAdded }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)   // { plant, source }
  const [error, setError] = useState(null)

  async function handleAsk(plantName) {
    const name = (plantName || query).trim()
    if (!name) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await axios.post('/api/ask', { plant_name: name })
      setResult(res.data)
      if (res.data.source === 'ai' && onPlantAdded) {
        onPlantAdded(res.data.plant)
      }
    } catch (err) {
      if (err.response?.status === 404 && err.response?.data?.not_found) {
        setError(err.response.data.message)
      } else {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAsk()
  }

  return (
    <div className="ai-search-section">
      {/* Header */}
      <div className="ai-search-header">
        <div className="ai-search-icon-wrap">
          <span className="ai-search-sparkle">✨</span>
        </div>
        <div>
          <h3 className="ai-search-title">Ask AI About Any Plant</h3>
          <p className="ai-search-subtitle">
            Type any plant name — cilantro, jasmine, fig, turmeric — and our AI will generate a complete
            profile and add it to the Plan-t Ahead database instantly.
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="ai-input-row">
        <input
          type="text"
          className="ai-input"
          placeholder="e.g. Cilantro, Jasmine, Fig, Turmeric..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="ai-ask-btn"
          onClick={() => handleAsk()}
          disabled={loading || !query.trim()}
        >
          {loading ? (
            <span className="ai-btn-loading">
              <span className="ai-spinner" />
              Thinking...
            </span>
          ) : (
            '🌿 Ask AI'
          )}
        </button>
      </div>

      {/* Suggestion chips */}
      {!result && !loading && (
        <div className="ai-suggestions">
          <span className="ai-suggestions-label">Try:</span>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              className="ai-suggestion-chip"
              onClick={() => {
                setQuery(s)
                handleAsk(s)
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="ai-loading-state">
          <div className="ai-loading-dots">
            <span /><span /><span />
          </div>
          <p>Consulting botanical knowledge for <strong>"{query}"</strong>...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="ai-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="ai-result-wrap">
          {result.source === 'database' && (
            <div className="ai-already-exists">
              <span>📚</span>
              <span><strong>{result.plant.name}</strong> is already in our database — showing the existing profile.</span>
            </div>
          )}
          <PlantPreviewCard plant={result.plant} isNew={result.source === 'ai'} />
          <button className="ai-reset-btn" onClick={() => { setResult(null); setQuery('') }}>
            🔍 Search another plant
          </button>
        </div>
      )}
    </div>
  )
}
