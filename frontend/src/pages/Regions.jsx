import { useState, useEffect } from 'react'
import axios from 'axios'
import RegionCard from '../components/RegionCard'

export default function Regions() {
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRegions() {
      try {
        const res = await axios.get('/api/regions')
        setRegions(res.data)
      } catch (err) {
        setError('Failed to load regions. Make sure the backend is running.')
      } finally {
        setLoading(false)
      }
    }
    fetchRegions()
  }, [])

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading climate regions...</p>
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

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>🗺️ Climate Regions</h1>
          <p>
            Explore the world's major climate zones and discover which plants thrive in each environment.
            From tropical rainforests to arctic tundra — every region has its champions.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="card-grid card-grid-sm">
          {regions.map(region => (
            <RegionCard key={region.id} region={region} />
          ))}
        </div>

        {regions.length === 0 && (
          <div className="empty-state">
            <span className="empty-state-icon">🌍</span>
            <h3>No regions found</h3>
            <p>Try seeding the database first.</p>
          </div>
        )}
      </section>
    </div>
  )
}
