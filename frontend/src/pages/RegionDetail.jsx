import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import PlantCard from '../components/PlantCard'

const regionEmojis = {
  'Tropical': '🌴',
  'Subtropical': '🌞',
  'Temperate': '🍂',
  'Mediterranean': '🫒',
  'Arid / Desert': '🏜️',
  'Alpine / Arctic': '🏔️',
}

const categoryEmojis = {
  vegetable: '🥦',
  fruit: '🍎',
  grain: '🌾',
  herb: '🌿',
  flower: '🌸',
  succulent: '🌵',
}

export default function RegionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [region, setRegion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    async function fetchRegion() {
      try {
        const res = await axios.get(`/api/regions/${id}`)
        setRegion(res.data)
      } catch (err) {
        setError('Region not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchRegion()
  }, [id])

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading region details...</p>
      </div>
    )
  }

  if (error || !region) {
    return (
      <div className="error-state">
        <span className="error-icon">🥀</span>
        <p>{error || 'Region not found.'}</p>
      </div>
    )
  }

  const plants = region.plants || []

  // Get unique categories for this region's plants
  const categories = ['All', ...new Set(plants.map(p => p.category).filter(Boolean))]

  const filteredPlants = activeCategory === 'All'
    ? plants
    : plants.filter(p => p.category === activeCategory)

  // Group by category for the "All" view
  const groupedByCategory = plants.reduce((acc, plant) => {
    const cat = plant.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(plant)
    return acc
  }, {})

  return (
    <div>
      {/* Header */}
      <div className="region-detail-header">
        <span className="region-detail-emoji">
          {regionEmojis[region.name] || '🌍'}
        </span>
        <h1>{region.name}</h1>
        <div className="region-detail-meta">
          <span className="badge climate">{region.climate}</span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            🌡️ {region.avg_temp_min}°C — {region.avg_temp_max}°C
          </span>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            🌿 {plants.length} plants
          </span>
        </div>
      </div>

      <div className="region-detail-content">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Info Card */}
        <div className="region-info-card">
          <div className="region-info-item">
            <span className="label">Climate Type</span>
            <span className="value">{region.climate}</span>
          </div>
          <div className="region-info-item">
            <span className="label">Min Temperature</span>
            <span className="value">{region.avg_temp_min}°C</span>
          </div>
          <div className="region-info-item">
            <span className="label">Max Temperature</span>
            <span className="value">{region.avg_temp_max}°C</span>
          </div>
          <div className="region-info-item">
            <span className="label">Total Plants</span>
            <span className="value">{plants.length} varieties</span>
          </div>
        </div>

        {/* Description */}
        <p className="region-description-text">{region.description}</p>

        {/* Category Filter Tabs */}
        {categories.length > 2 && (
          <div className="filter-bar" style={{ marginBottom: '28px' }}>
            <span className="filter-label">Filter:</span>
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? '🌍 All' : `${categoryEmojis[cat] || ''} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
              </button>
            ))}
          </div>
        )}

        {/* Plants */}
        {plants.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🌱</span>
            <h3>No plants listed for this region</h3>
            <p>Check back later as we add more plants to our database.</p>
          </div>
        ) : activeCategory !== 'All' ? (
          <>
            <p className="results-count">
              {filteredPlants.length} {activeCategory}{filteredPlants.length !== 1 ? 's' : ''} in {region.name}
            </p>
            <div className="card-grid">
              {filteredPlants.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          </>
        ) : (
          /* Grouped by category */
          Object.entries(groupedByCategory).map(([cat, catPlants]) => (
            <div key={cat} className="category-section">
              <h3 className="category-section-title">
                {categoryEmojis[cat] || '🌿'} {cat.charAt(0).toUpperCase() + cat.slice(1)}s
                <span style={{ fontSize: '0.82rem', fontWeight: 400, color: '#6b8f71' }}>
                  &nbsp;({catPlants.length})
                </span>
              </h3>
              <div className="card-grid">
                {catPlants.map(plant => (
                  <PlantCard key={plant.id} plant={plant} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
