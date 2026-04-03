import { Link } from 'react-router-dom'

const difficultyColors = { easy: '#52b788', medium: '#f4a261', hard: '#e76f51' }

export default function PlantCard({ plant }) {
  return (
    <Link to={`/plants/${plant.id}`} className="plant-card">
      <div className="plant-card-emoji">{plant.emoji}</div>
      <div className="plant-card-body">
        <h3 className="plant-name">{plant.name}</h3>
        <p className="plant-sci">{plant.scientific_name}</p>
        <div className="plant-badges">
          <span className="badge category">{plant.category}</span>
          <span
            className="badge difficulty"
            style={{ background: difficultyColors[plant.difficulty] || '#888' }}
          >
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
    </Link>
  )
}
