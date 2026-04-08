import { Link } from 'react-router-dom'

const difficultyColors = { easy: '#52b788', medium: '#f4a261', hard: '#e76f51' }
const waterIcons = { Low: '💧', Moderate: '💧💧', High: '💧💧💧' }
const sunlightIcons = { 'Full Sun': '☀️', 'Partial Shade': '⛅', 'Shade': '🌥️' }

export default function PlantCard({ plant }) {
  return (
    <Link to={`/plants/${plant.id}`} className="plant-card-flip-wrapper">
      <div className="plant-card-flip">
        {/* Front */}
        <div className="plant-card plant-card-front">
          <div className="plant-card-emoji">{plant.emoji}</div>
          <div className="plant-card-body">
            <h3 className="plant-name">{plant.name}</h3>
            <p className="plant-sci">{plant.scientific_name}</p>
            <div className="plant-badges">
              <span className="badge category">{plant.category}</span>
              <span className="badge difficulty" style={{ background: difficultyColors[plant.difficulty] || '#888' }}>
                {plant.difficulty}
              </span>
            </div>
            <div className="plant-meta">
              <span>🌡️ {plant.temp_optimal}°C optimal</span>
              <span>🌱 {plant.germination_weeks_min}–{plant.germination_weeks_max}w germination</span>
            </div>
            <div className="plant-regions">
              {plant.regions && plant.regions.map(r => (
                <span key={r.id} className="tag">{r.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="plant-card plant-card-back">
          <div className="plant-card-back-emoji">{plant.emoji}</div>
          <h3 className="plant-card-back-name">{plant.name}</h3>
          <div className="plant-card-back-stats">
            <div className="flip-stat">
              <span className="flip-stat-icon">{sunlightIcons[plant.sunlight] || '☀️'}</span>
              <span className="flip-stat-label">Sunlight</span>
              <span className="flip-stat-value">{plant.sunlight}</span>
            </div>
            <div className="flip-stat">
              <span className="flip-stat-icon">{waterIcons[plant.water_needs] || '💧'}</span>
              <span className="flip-stat-label">Water</span>
              <span className="flip-stat-value">{plant.water_needs}</span>
            </div>
            <div className="flip-stat">
              <span className="flip-stat-icon">⭐</span>
              <span className="flip-stat-label">Difficulty</span>
              <span className="flip-stat-value" style={{ color: difficultyColors[plant.difficulty] }}>
                {plant.difficulty}
              </span>
            </div>
            <div className="flip-stat">
              <span className="flip-stat-icon">🍽️</span>
              <span className="flip-stat-label">Harvest</span>
              <span className="flip-stat-value">{plant.fruit_bearing_weeks_min}–{plant.fruit_bearing_weeks_max}w</span>
            </div>
          </div>
          <span className="flip-cta">View Details →</span>
        </div>
      </div>
    </Link>
  )
}
