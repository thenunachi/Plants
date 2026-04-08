import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useGardenContext } from '../context/GardenContext'
import { AddModal } from './MyGarden'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const MONTH_TIPS = [
  'A quiet month. Start chilli peppers and aubergines indoors in a heated propagator.',
  'Sow tomatoes, peppers, and celery indoors. Early seed potatoes can be chitted.',
  'Busy sowing season begins. Start broad beans, peas, onions, and leeks indoors.',
  'Last frost risk in most temperate regions. Transplant brassicas; sow squash indoors.',
  'Transplant tomatoes, courgettes, and squash after the last frost. Direct sow beans.',
  'Direct sow salads, beetroot, and carrots outdoors. Harvest early strawberries.',
  'Peak harvest month — tomatoes, cucumbers, beans, courgettes. Sow autumn brassicas.',
  'Harvest continues. Sow autumn salads and spinach. Plant garlic and spring bulbs.',
  'Harvest squash, apples, and root vegetables. Plant garlic. Clear spent crops.',
  'Final harvests before frost. Protect tender plants. Plant tulip bulbs.',
  'Dig and store dahlias. Plant bare-root fruit trees and roses. Rest the soil.',
  'Plan next year\'s garden. Order seeds. Protect tender perennials from hard frost.',
]

const CATEGORIES = ['All', 'vegetable', 'fruit', 'grain', 'herb', 'flower', 'succulent']
const CATEGORY_EMOJIS = {
  vegetable: '🥕', fruit: '🍎', grain: '🌾',
  herb: '🌿', flower: '🌸', succulent: '🌵'
}

function plantMatchesMonth(plant, month, hemisphere) {
  // month is 0-based index; adjust 6 months for Southern Hemisphere
  const m = hemisphere === 'south' ? ((month + 6) % 12) + 1 : month + 1

  const cal = plant.calendar || {}
  const inRange = (start, end) => {
    if (!start || !end) return false
    if (start <= end) return m >= start && m <= end
    return m >= start || m <= end   // wraps year e.g. Nov–Mar
  }

  return {
    sowIndoors: inRange(cal.sow_indoors_start, cal.sow_indoors_end),
    transplant: inRange(cal.transplant_start, cal.transplant_end),
    harvest:    inRange(cal.harvest_start, cal.harvest_end),
  }
}

function CalendarPlantCard({ plant, type, onAdd }) {
  const { isInGarden } = useGardenContext()
  const inGarden = isInGarden(plant.id)

  const typeColors = {
    sowIndoors: '#74b9ff',
    transplant: '#f4a261',
    harvest:    '#52b788',
  }

  return (
    <div className="cal-plant-card" style={{ borderLeftColor: typeColors[type] }}>
      <span className="cal-plant-emoji">{plant.emoji}</span>
      <div className="cal-plant-body">
        <Link to={`/plants/${plant.id}`} className="cal-plant-name">{plant.name}</Link>
        <div className="cal-plant-meta">
          <span className="badge category" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
            {plant.category}
          </span>
          <span className="cal-plant-temp">🌡️ {plant.temp_optimal}°C</span>
        </div>
      </div>
      <button
        className={`cal-add-btn ${inGarden ? 'cal-in-garden' : ''}`}
        onClick={() => !inGarden && onAdd(plant)}
        title={inGarden ? 'Already in your garden' : 'Add to My Garden'}
      >
        {inGarden ? '✓' : '+'}
      </button>
    </div>
  )
}

export default function PlantingCalendar() {
  const [allPlants, setAllPlants]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [month, setMonth]             = useState(new Date().getMonth())  // 0-based
  const [hemisphere, setHemisphere]   = useState('north')
  const [category, setCategory]       = useState('All')
  const [addTarget, setAddTarget]     = useState(null)  // plant to add via modal
  const { addPlant, isInGarden }      = useGardenContext()

  useEffect(() => {
    axios.get('/api/plants').then(r => {
      setAllPlants(r.data)
      setLoading(false)
    })
  }, [])

  const filtered = category === 'All'
    ? allPlants
    : allPlants.filter(p => p.category === category)

  // Classify each plant for the current month
  const sowIndoors = []
  const transplant = []
  const harvest    = []

  filtered.forEach(p => {
    const match = plantMatchesMonth(p, month, hemisphere)
    if (match.sowIndoors) sowIndoors.push(p)
    if (match.transplant) transplant.push(p)
    if (match.harvest)    harvest.push(p)
  })

  const totalActive = new Set([
    ...sowIndoors.map(p => p.id),
    ...transplant.map(p => p.id),
    ...harvest.map(p => p.id),
  ]).size

  const prevMonth = () => setMonth(m => (m + 11) % 12)
  const nextMonth = () => setMonth(m => (m + 1) % 12)

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>📅 Planting Calendar</h1>
          <p>See exactly what to sow, transplant, and harvest each month.</p>
        </div>
      </div>

      {/* Month navigator */}
      <div className="cal-nav-bar">
        <div className="cal-month-nav">
          <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
          <div className="cal-month-picker">
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="cal-month-select"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <span className="cal-month-label">{MONTHS[month]}</span>
          </div>
          <button className="cal-nav-btn" onClick={nextMonth}>›</button>
        </div>

        {/* Hemisphere toggle */}
        <div className="cal-hemisphere-toggle">
          <button
            className={`hemi-btn ${hemisphere === 'north' ? 'hemi-active' : ''}`}
            onClick={() => setHemisphere('north')}
          >🌍 Northern</button>
          <button
            className={`hemi-btn ${hemisphere === 'south' ? 'hemi-active' : ''}`}
            onClick={() => setHemisphere('south')}
          >🌏 Southern</button>
        </div>

        {/* Category filter */}
        <div className="cal-cat-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'All' ? '🌍 All' : `${CATEGORY_EMOJIS[cat] || ''} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Month tip */}
      <div className="cal-month-tip">
        <span className="cal-tip-icon">💡</span>
        <span>{MONTH_TIPS[month]}</span>
        {totalActive > 0 && (
          <span className="cal-active-count">{totalActive} plant{totalActive !== 1 ? 's' : ''} active this month</span>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Loading calendar...</p>
        </div>
      ) : (
        <div className="cal-columns">
          {/* Sow Indoors */}
          <div className="cal-column">
            <div className="cal-col-header sow-header">
              <span className="cal-col-icon">🏠</span>
              <div>
                <div className="cal-col-title">Sow Indoors</div>
                <div className="cal-col-count">{sowIndoors.length} plants</div>
              </div>
            </div>
            {sowIndoors.length === 0
              ? <p className="cal-col-empty">Nothing to sow indoors this month.</p>
              : sowIndoors.map(p => (
                <CalendarPlantCard key={p.id} plant={p} type="sowIndoors" onAdd={setAddTarget} />
              ))
            }
          </div>

          {/* Transplant */}
          <div className="cal-column">
            <div className="cal-col-header transplant-header">
              <span className="cal-col-icon">🌿</span>
              <div>
                <div className="cal-col-title">Transplant Outdoors</div>
                <div className="cal-col-count">{transplant.length} plants</div>
              </div>
            </div>
            {transplant.length === 0
              ? <p className="cal-col-empty">Nothing to transplant this month.</p>
              : transplant.map(p => (
                <CalendarPlantCard key={p.id} plant={p} type="transplant" onAdd={setAddTarget} />
              ))
            }
          </div>

          {/* Harvest */}
          <div className="cal-column">
            <div className="cal-col-header harvest-header">
              <span className="cal-col-icon">🍽️</span>
              <div>
                <div className="cal-col-title">Ready to Harvest</div>
                <div className="cal-col-count">{harvest.length} plants</div>
              </div>
            </div>
            {harvest.length === 0
              ? <p className="cal-col-empty">Nothing to harvest this month.</p>
              : harvest.map(p => (
                <CalendarPlantCard key={p.id} plant={p} type="harvest" onAdd={setAddTarget} />
              ))
            }
          </div>
        </div>
      )}

      {/* 12-month overview strip */}
      <div className="cal-year-strip">
        <h3 className="cal-year-title">Year at a Glance</h3>
        <div className="cal-year-grid">
          {MONTHS.map((name, i) => {
            const count = allPlants.filter(p => {
              const m = plantMatchesMonth(p, i, hemisphere)
              return m.sowIndoors || m.transplant || m.harvest
            }).length
            return (
              <button
                key={i}
                className={`cal-year-cell ${i === month ? 'cal-year-active' : ''}`}
                onClick={() => setMonth(i)}
              >
                <span className="cal-year-month">{name.slice(0, 3)}</span>
                <span className="cal-year-bar">
                  <span
                    className="cal-year-bar-fill"
                    style={{ height: `${Math.round((count / Math.max(allPlants.length, 1)) * 100)}%` }}
                  />
                </span>
                <span className="cal-year-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Add to garden modal */}
      {addTarget && (
        <AddModal
          plant={addTarget}
          onAdd={(stage, notes) => addPlant(addTarget, stage, notes)}
          onClose={() => setAddTarget(null)}
        />
      )}
    </div>
  )
}
