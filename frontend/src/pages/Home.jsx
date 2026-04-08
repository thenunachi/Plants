import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PlantCard from '../components/PlantCard'
import RegionCard from '../components/RegionCard'
import WeatherWidget from '../components/WeatherWidget'
import PlantAISearch from '../components/PlantAISearch'

export default function Home() {
  const [stats, setStats] = useState(null)
  const [regions, setRegions] = useState([])
  const [featuredPlants, setFeaturedPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, regionsRes, plantsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/regions'),
        axios.get('/api/plants'),
      ])
      setStats(statsRes.data)
      setRegions(regionsRes.data)
      const shuffled = [...plantsRes.data].sort(() => Math.random() - 0.5)
      setFeaturedPlants(shuffled.slice(0, 6))
    } catch {
      setError('Failed to load data. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Called when AI adds a new plant — refresh stats + featured list
  function handlePlantAdded(newPlant) {
    setStats(prev => {
      if (!prev) return prev
      const cat = newPlant.category
      return {
        ...prev,
        total_plants: prev.total_plants + 1,
        by_category: {
          ...prev.by_category,
          [cat]: (prev.by_category[cat] || 0) + 1,
        },
      }
    })
    // Add to featured if fewer than 6 are showing
    setFeaturedPlants(prev =>
      prev.length < 6 ? [...prev, newPlant] : prev
    )
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Growing the garden...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state">
        <span className="error-icon">🥀</span>
        <p>{error}</p>
      </div>
    )
  }

  const categoryCount = stats ? Object.keys(stats.by_category).length : 0

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-icon">🌿</span>
          <h1>Grow the <span>Right Plant</span>,<br />in the Right Place</h1>
          <p>
            Discover plants suited to your climate. Explore growing requirements, germination
            timelines, temperature ranges, and ideal regions — all in one place.
          </p>
          <div className="hero-buttons">
            <Link to="/plants" className="btn btn-primary">🌱 Explore Plants</Link>
            <Link to="/regions" className="btn btn-outline">🗺️ Browse Regions</Link>
          </div>
        </div>
      </section>

      {/* AI Plant Search */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">✨ Ask AI About Any Plant</h2>
        </div>
        <PlantAISearch onPlantAdded={handlePlantAdded} />
      </section>

      {/* Weather Widget */}
      <section className="section section-weather">
        <div className="section-header">
          <h2 className="section-title">🌤️ Your Local Weather</h2>
        </div>
        <WeatherWidget />
      </section>

      {/* Stats Bar */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{stats.total_plants}</span>
            <span className="stat-label">Total Plants</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.total_regions}</span>
            <span className="stat-label">Climate Regions</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{categoryCount}</span>
            <span className="stat-label">Categories</span>
          </div>
          {stats.by_category && Object.entries(stats.by_category).slice(0, 2).map(([cat, count]) => (
            <div className="stat-item" key={cat}>
              <span className="stat-number">{count}</span>
              <span className="stat-label">{cat}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Browse by Region */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">🗺️ Browse by Region</h2>
          <Link to="/regions" className="section-link">View All Regions →</Link>
        </div>
        <div className="card-grid card-grid-sm">
          {regions.map(region => (
            <RegionCard key={region.id} region={region} />
          ))}
        </div>
      </section>

      {/* Featured Plants */}
      <div className="home-featured">
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">🌟 Featured Plants</h2>
            <Link to="/plants" className="section-link">View All Plants →</Link>
          </div>
          <div className="card-grid">
            {featuredPlants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>🌱 Plan-t Ahead &copy; {new Date().getFullYear()} — Grow Smarter, Not Harder</p>
      </footer>
    </div>
  )
}
