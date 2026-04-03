import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import PlantCard from '../components/PlantCard'
import SearchBar from '../components/SearchBar'

const CATEGORIES = ['All', 'vegetable', 'fruit', 'grain', 'herb', 'flower', 'succulent']
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard']

export default function Plants() {
  const [plants, setPlants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')

  const fetchPlants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (category !== 'All') params.category = category
      if (difficulty !== 'All') params.difficulty = difficulty
      if (search.trim()) params.search = search.trim()

      const res = await axios.get('/api/plants', { params })
      setPlants(res.data)
    } catch (err) {
      setError('Failed to fetch plants. Please ensure the backend server is running.')
    } finally {
      setLoading(false)
    }
  }, [category, difficulty, search])

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPlants()
    }, 300)
    return () => clearTimeout(debounce)
  }, [fetchPlants])

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>🌿 Plant Encyclopedia</h1>
          <p>Browse our collection of {plants.length > 0 ? plants.length : ''} plants. Filter by category, difficulty, or search by name.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-panel">
        <SearchBar value={search} onChange={setSearch} />

        <div className="filter-row">
          <span className="filter-label">Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'All' ? '🌍 All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <span className="filter-label">Difficulty:</span>
          {DIFFICULTIES.map(diff => (
            <button
              key={diff}
              className={`filter-btn ${difficulty === diff ? 'active' : ''}`}
              onClick={() => setDifficulty(diff)}
            >
              {diff === 'All' ? 'All'
                : diff === 'easy' ? '🟢 Easy'
                : diff === 'medium' ? '🟡 Medium'
                : '🔴 Hard'}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="plants-grid-section">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Finding plants...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <span className="error-icon">🥀</span>
            <p>{error}</p>
          </div>
        ) : plants.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <h3>No plants found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        ) : (
          <>
            <p className="results-count">
              Showing {plants.length} plant{plants.length !== 1 ? 's' : ''}
              {category !== 'All' ? ` in "${category}"` : ''}
              {difficulty !== 'All' ? ` · ${difficulty} difficulty` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>
            <div className="card-grid">
              {plants.map(plant => (
                <PlantCard key={plant.id} plant={plant} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
