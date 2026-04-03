import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const regionEmojis = {
  'Tropical': '🌴',
  'Subtropical': '🌞',
  'Temperate': '🍂',
  'Mediterranean': '🫒',
  'Arid / Desert': '🏜️',
  'Alpine / Arctic': '🏔️',
}

const difficultyColors = { easy: '#52b788', medium: '#f4a261', hard: '#e76f51' }
const waterIcons = { Low: '💧', Moderate: '💧💧', High: '💧💧💧' }
const sunlightIcons = { 'Full Sun': '☀️', 'Partial Shade': '⛅', 'Shade': '🌥️' }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatWeeks(min, max) {
  if (!min && !max) return 'N/A'
  if (min === max) return `${min} weeks`
  if (max >= 260) {
    const minY = (min / 52).toFixed(0)
    const maxY = (max / 52).toFixed(0)
    return `${minY}–${maxY} years`
  }
  return `${min}–${max} weeks`
}

// ── Planting Calendar ────────────────────────────────────────
function CalendarBar({ start, end, color, label }) {
  if (!start) return null

  const cells = MONTHS.map((_, i) => {
    const month = i + 1
    let active = false
    if (start <= end) {
      active = month >= start && month <= end
    } else {
      // wraps year (e.g. Nov–Mar)
      active = month >= start || month <= end
    }
    return active
  })

  return (
    <div className="cal-row">
      <span className="cal-label">{label}</span>
      <div className="cal-cells">
        {cells.map((active, i) => (
          <div
            key={i}
            className={`cal-cell ${active ? 'cal-active' : ''}`}
            style={active ? { background: color } : {}}
            title={MONTHS[i]}
          >
            <span className="cal-month-name">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanningCalendar({ calendar, regions }) {
  const { sow_indoors_start, sow_indoors_end, transplant_start, transplant_end, harvest_start, harvest_end } = calendar

  // Get frost months from the first frost-experiencing region
  const frostRegion = regions?.find(r => r.last_frost_month)

  return (
    <div className="detail-section">
      <h2>📅 Planting Calendar</h2>
      <p className="cal-note">
        Based on Northern Hemisphere timing. Adjust 6 months for Southern Hemisphere.
        {frostRegion && (
          <span className="frost-badge">
            ❄️ Last frost: ~{MONTHS[frostRegion.last_frost_month - 1]} · First frost: ~{MONTHS[(frostRegion.first_frost_month || 10) - 1]}
          </span>
        )}
      </p>
      <div className="cal-grid">
        <CalendarBar start={sow_indoors_start} end={sow_indoors_end} color="#74b9ff" label="🏠 Sow Indoors" />
        <CalendarBar start={transplant_start} end={transplant_end} color="#f4a261" label="🌿 Transplant" />
        <CalendarBar start={harvest_start} end={harvest_end} color="#52b788" label="🍽️ Harvest" />
      </div>
      <div className="cal-legend">
        {sow_indoors_start && <span className="cal-legend-item"><span className="cal-legend-dot" style={{ background: '#74b9ff' }} />Sow Indoors</span>}
        {transplant_start && <span className="cal-legend-item"><span className="cal-legend-dot" style={{ background: '#f4a261' }} />Transplant</span>}
        {harvest_start && <span className="cal-legend-item"><span className="cal-legend-dot" style={{ background: '#52b788' }} />Harvest</span>}
      </div>
    </div>
  )
}

// ── Companion Planting ───────────────────────────────────────
function CompanionGuide({ companions, foes, pests }) {
  const [tab, setTab] = useState('companions')

  return (
    <div className="detail-section">
      <h2>🤝 Companion Planting & Pests</h2>
      <div className="companion-tabs">
        <button className={`ctab ${tab === 'companions' ? 'ctab-active' : ''}`} onClick={() => setTab('companions')}>
          ✅ Friends ({companions.length})
        </button>
        <button className={`ctab ${tab === 'foes' ? 'ctab-active' : ''}`} onClick={() => setTab('foes')}>
          ❌ Foes ({foes.length})
        </button>
        <button className={`ctab ${tab === 'pests' ? 'ctab-active' : ''}`} onClick={() => setTab('pests')}>
          🐛 Pests & Diseases ({pests.length})
        </button>
      </div>

      {tab === 'companions' && (
        <div className="companion-list">
          {companions.map((c, i) => (
            <div key={i} className="companion-card friend">
              <div className="companion-card-header">
                <span className="companion-icon">🌿</span>
                <strong>{c.name}</strong>
              </div>
              <p>{c.benefit}</p>
            </div>
          ))}
          {companions.length === 0 && <p className="companion-empty">No companion data available.</p>}
        </div>
      )}

      {tab === 'foes' && (
        <div className="companion-list">
          {foes.map((f, i) => (
            <div key={i} className="companion-card foe">
              <div className="companion-card-header">
                <span className="companion-icon">⚠️</span>
                <strong>Keep away from {f.name}</strong>
              </div>
              <p>{f.reason}</p>
            </div>
          ))}
          {foes.length === 0 && <p className="companion-empty">No incompatibility data available.</p>}
        </div>
      )}

      {tab === 'pests' && (
        <div className="companion-list">
          {pests.map((p, i) => (
            <div key={i} className="companion-card pest">
              <div className="companion-card-header">
                <span className="companion-icon">🔍</span>
                <strong>{p.name}</strong>
              </div>
              <p>{p.description}</p>
            </div>
          ))}
          {pests.length === 0 && <p className="companion-empty">No pest data available.</p>}
        </div>
      )}
    </div>
  )
}

// ── Indoor / Outdoor Guide ───────────────────────────────────
function IndoorGuide({ plant }) {
  const phRange = plant.soil_ph_min && plant.soil_ph_max
    ? `${plant.soil_ph_min} – ${plant.soil_ph_max}`
    : 'N/A'

  const phLabel = () => {
    if (!plant.soil_ph_min) return ''
    const avg = (plant.soil_ph_min + plant.soil_ph_max) / 2
    if (avg < 6.0) return '(Acidic)'
    if (avg > 7.0) return '(Alkaline)'
    return '(Neutral)'
  }

  // pH bar: 4.0 = 0%, 9.0 = 100%
  const phToPercent = (ph) => ((ph - 4.0) / 5.0) * 100

  return (
    <div className="detail-section">
      <h2>🏠 Indoor / Outdoor Guide</h2>

      <div className="indoor-grid">
        {/* Indoor capable */}
        <div className={`indoor-badge-card ${plant.is_indoor_capable ? 'can-indoor' : 'no-indoor'}`}>
          <span className="indoor-badge-icon">{plant.is_indoor_capable ? '🏡' : '🌳'}</span>
          <div>
            <strong>{plant.is_indoor_capable ? 'Indoor Capable' : 'Outdoor Only'}</strong>
            <p>
              {plant.is_indoor_capable
                ? 'Can be grown in containers indoors or overwintered inside.'
                : 'This plant needs to be grown outdoors and cannot be successfully kept indoors long-term.'}
            </p>
          </div>
        </div>

        {/* Overwintering threshold */}
        {plant.overwintering_temp !== null && plant.overwintering_temp !== undefined && (
          <div className="indoor-badge-card threshold">
            <span className="indoor-badge-icon">🌡️</span>
            <div>
              <strong>Bring Indoors Below {plant.overwintering_temp}°C</strong>
              <p>Move to a frost-free location when outdoor temperatures fall below this threshold.</p>
            </div>
          </div>
        )}
      </div>

      {/* Overwintering tips */}
      {plant.overwintering_tips && (
        <div className="overwintering-tips">
          <h4>❄️ Overwintering Instructions</h4>
          <p>{plant.overwintering_tips}</p>
        </div>
      )}

      {/* Soil pH */}
      <div className="ph-section">
        <h4>🧪 Soil pH Requirement: <span className="ph-value">{phRange} {phLabel()}</span></h4>
        <div className="ph-bar-wrapper">
          <div className="ph-bar-track">
            <div
              className="ph-bar-fill"
              style={{
                left: `${phToPercent(plant.soil_ph_min || 6)}%`,
                width: `${phToPercent(plant.soil_ph_max || 7) - phToPercent(plant.soil_ph_min || 6)}%`,
              }}
            />
          </div>
          <div className="ph-bar-labels">
            <span>4.0 Acidic</span>
            <span>6.5 Neutral</span>
            <span>9.0 Alkaline</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Propagation & Care ───────────────────────────────────────
function PropagationCare({ plant }) {
  const methods = plant.propagation_method ? plant.propagation_method.split(',').map(m => m.trim()) : []

  const methodIcons = {
    'Seed': '🌱',
    'Seed (direct sow)': '🌱',
    'Seed (transplanted seedling)': '🌱',
    'Seed (whole nut)': '🥥',
    'Cutting': '✂️',
    'Semi-hardwood Cutting': '✂️',
    'Softwood/Hardwood Cutting': '✂️',
    'Stem Cutting in water': '💧',
    'Grafting': '🔗',
    'Budding': '🔗',
    'Layering': '🌿',
    'Runner (stolon) rooting': '🏃',
    'Sucker (pup) division': '🪴',
    'Corm division': '🪴',
    'Tuber (seed potato) division': '🥔',
    'Offshoot (pup) division': '🪴',
  }

  return (
    <div className="detail-section">
      <h2>🌿 Propagation &amp; Care</h2>

      {/* Propagation methods */}
      <h4 className="care-subtitle">Propagation Methods</h4>
      <div className="propagation-methods">
        {methods.map((m, i) => (
          <div key={i} className="prop-method-card">
            <span className="prop-method-icon">{methodIcons[m] || '🌱'}</span>
            <span>{m}</span>
          </div>
        ))}
      </div>

      {/* Pruning tips */}
      {plant.pruning_tips && (
        <div className="pruning-card">
          <h4 className="care-subtitle">✂️ Pruning &amp; Maintenance</h4>
          <p>{plant.pruning_tips}</p>
        </div>
      )}
    </div>
  )
}

// ── Temperature Bar ──────────────────────────────────────────
function TemperatureBar({ tempMin, tempMax, tempOptimal }) {
  const globalMin = -25
  const globalMax = 55
  const range = globalMax - globalMin
  const toPercent = (val) => ((val - globalMin) / range) * 100

  const minPct = Math.max(0, Math.min(100, toPercent(tempMin)))
  const maxPct = Math.max(0, Math.min(100, toPercent(tempMax)))
  const optPct = Math.max(0, Math.min(100, toPercent(tempOptimal)))

  return (
    <div className="temp-section">
      <h3>🌡️ Temperature Range</h3>
      <div className="temp-bar-wrapper">
        <div className="temp-bar-track">
          <div className="temp-marker" style={{ left: `${minPct}%` }}>
            <div className="temp-marker-dot" style={{ background: '#74b9ff' }} />
            <span className="temp-marker-label">{tempMin}°C min</span>
          </div>
          <div className="temp-marker" style={{ left: `${optPct}%` }}>
            <div className="temp-marker-dot" style={{ background: '#2d6a4f' }} />
            <span className="temp-marker-label">{tempOptimal}°C optimal</span>
          </div>
          <div className="temp-marker" style={{ left: `${maxPct}%` }}>
            <div className="temp-marker-dot" style={{ background: '#e76f51' }} />
            <span className="temp-marker-label">{tempMax}°C max</span>
          </div>
        </div>
        <div className="temp-legend">
          <span>Cold ({globalMin}°C)</span>
          <span>Moderate (15°C)</span>
          <span>Hot ({globalMax}°C)</span>
        </div>
      </div>
    </div>
  )
}

// ── Growing Tips ─────────────────────────────────────────────
function getTips(plant) {
  const tips = []
  if (plant.difficulty === 'easy') {
    tips.push({ icon: '🟢', text: 'Great for beginners! This plant is forgiving and adapts well to varying conditions.' })
  } else if (plant.difficulty === 'medium') {
    tips.push({ icon: '🟡', text: 'Requires some experience. Pay attention to watering schedules and soil quality.' })
  } else {
    tips.push({ icon: '🔴', text: 'Experienced gardeners only. This plant needs precise conditions to thrive.' })
  }
  if (plant.water_needs === 'High') {
    tips.push({ icon: '💧', text: 'Water frequently and ensure the soil stays consistently moist. Avoid waterlogging.' })
  } else if (plant.water_needs === 'Low') {
    tips.push({ icon: '🏜️', text: 'Let the soil dry out between waterings. Overwatering is the main risk for this plant.' })
  } else {
    tips.push({ icon: '🚿', text: 'Water moderately. Check soil moisture 2–3 times per week, especially in summer.' })
  }
  if (plant.sunlight === 'Full Sun') {
    tips.push({ icon: '☀️', text: 'Plant in a spot that receives at least 6–8 hours of direct sunlight daily.' })
  } else if (plant.sunlight === 'Partial Shade') {
    tips.push({ icon: '⛅', text: 'Ideal in dappled light or a spot with morning sun and afternoon shade.' })
  } else {
    tips.push({ icon: '🌥️', text: 'Thrives in low light. Protect from direct midday sun which can scorch the leaves.' })
  }
  tips.push({ icon: '🌱', text: `Germination typically takes ${plant.germination_weeks_min}–${plant.germination_weeks_max} weeks. Keep seeds warm and moist.` })
  if (plant.temp_min < 0) {
    tips.push({ icon: '❄️', text: `This plant can tolerate frost down to ${plant.temp_min}°C. Still, protect young seedlings from hard freezes.` })
  } else {
    tips.push({ icon: '🌡️', text: `Keep temperatures above ${plant.temp_min}°C. Optimal growth occurs around ${plant.temp_optimal}°C.` })
  }
  tips.push({ icon: '🪱', text: `Best grown in: ${plant.soil_type}. Good drainage is key to preventing root rot.` })
  return tips
}

// ── Main Component ───────────────────────────────────────────
export default function PlantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plant, setPlant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPlant() {
      try {
        const res = await axios.get(`/api/plants/${id}`)
        setPlant(res.data)
      } catch {
        setError('Plant not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchPlant()
  }, [id])

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p>Loading plant details...</p>
    </div>
  )

  if (error || !plant) return (
    <div className="error-state">
      <span className="error-icon">🥀</span>
      <p>{error || 'Plant not found.'}</p>
    </div>
  )

  const tips = getTips(plant)

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      {/* Hero */}
      <div className="detail-hero">
        <div className="detail-emoji">{plant.emoji}</div>
        <div className="detail-hero-info">
          <h1>{plant.name}</h1>
          <p className="detail-sci-name">{plant.scientific_name}</p>
          <div className="detail-badges">
            <span className="badge category">{plant.category}</span>
            <span className="badge difficulty" style={{ background: difficultyColors[plant.difficulty] || '#888' }}>
              {plant.difficulty}
            </span>
            <span className="badge" style={{ background: '#f0f7f1', color: '#2d6a4f' }}>
              {sunlightIcons[plant.sunlight] || '☀️'} {plant.sunlight}
            </span>
            <span className="badge" style={{ background: '#e8f4fd', color: '#1a4a7a' }}>
              {waterIcons[plant.water_needs] || '💧'} {plant.water_needs} Water
            </span>
            {plant.is_indoor_capable && (
              <span className="badge" style={{ background: '#fff3cd', color: '#856404' }}>🏡 Indoor Capable</span>
            )}
          </div>
          <p className="detail-description">{plant.description}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-card">
          <span className="info-card-icon">🌱</span>
          <span className="info-card-label">Germination Time</span>
          <span className="info-card-value">{formatWeeks(plant.germination_weeks_min, plant.germination_weeks_max)}</span>
          <span className="info-card-sub">From seed to sprout</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon">🍽️</span>
          <span className="info-card-label">Fruit Bearing</span>
          <span className="info-card-value">{formatWeeks(plant.fruit_bearing_weeks_min, plant.fruit_bearing_weeks_max)}</span>
          <span className="info-card-sub">Time to first harvest</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon">☀️</span>
          <span className="info-card-label">Sunlight Needs</span>
          <span className="info-card-value">{plant.sunlight}</span>
          <span className="info-card-sub">Daily light requirement</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon">💧</span>
          <span className="info-card-label">Water Needs</span>
          <span className="info-card-value">{plant.water_needs}</span>
          <span className="info-card-sub">{waterIcons[plant.water_needs] || ''} Irrigation level</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon">🪱</span>
          <span className="info-card-label">Soil Type</span>
          <span className="info-card-value" style={{ fontSize: '0.9rem' }}>{plant.soil_type}</span>
          <span className="info-card-sub">Ideal growing medium</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon">⭐</span>
          <span className="info-card-label">Difficulty</span>
          <span className="info-card-value" style={{ color: difficultyColors[plant.difficulty] || '#888', textTransform: 'capitalize' }}>
            {plant.difficulty}
          </span>
          <span className="info-card-sub">Growing complexity</span>
        </div>
      </div>

      {/* Temperature Bar */}
      <TemperatureBar tempMin={plant.temp_min} tempMax={plant.temp_max} tempOptimal={plant.temp_optimal} />

      {/* 1. Planting Calendar */}
      {plant.calendar && (
        <PlanningCalendar calendar={plant.calendar} regions={plant.regions} />
      )}

      {/* 2. Companion Planting */}
      {(plant.companions?.length > 0 || plant.foes?.length > 0 || plant.pests?.length > 0) && (
        <CompanionGuide companions={plant.companions || []} foes={plant.foes || []} pests={plant.pests || []} />
      )}

      {/* 3. Indoor / Outdoor */}
      <IndoorGuide plant={plant} />

      {/* 4. Propagation & Care */}
      {(plant.propagation_method || plant.pruning_tips) && (
        <PropagationCare plant={plant} />
      )}

      {/* Suitable Regions */}
      {plant.regions?.length > 0 && (
        <div className="detail-section">
          <h2>🗺️ Suitable Regions</h2>
          <div className="regions-chips">
            {plant.regions.map(region => (
              <Link key={region.id} to={`/regions/${region.id}`} className="region-chip">
                <span className="region-chip-emoji">{regionEmojis[region.name] || '🌍'}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{region.name}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 400, color: '#6b8f71' }}>
                    {region.avg_temp_min}°C – {region.avg_temp_max}°C
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Growing Tips */}
      <div className="detail-section">
        <h2>💡 Growing Tips</h2>
        <div className="tips-list">
          {tips.map((tip, i) => (
            <div key={i} className="tip-item">
              <span className="tip-icon">{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
