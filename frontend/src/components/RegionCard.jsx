import { Link } from 'react-router-dom'

const regionEmojis = {
  'Tropical': '🌴',
  'Subtropical': '🌞',
  'Temperate': '🍂',
  'Mediterranean': '🫒',
  'Arid / Desert': '🏜️',
  'Alpine / Arctic': '🏔️',
}

export default function RegionCard({ region }) {
  return (
    <Link to={`/regions/${region.id}`} className="region-card">
      <div className="region-emoji">{regionEmojis[region.name] || '🌍'}</div>
      <h3>{region.name}</h3>
      <span className="badge climate">{region.climate}</span>
      <p className="region-temp">🌡️ {region.avg_temp_min}°C — {region.avg_temp_max}°C</p>
      <p className="region-desc">{region.description}</p>
      <p className="region-plant-count">{region.plants?.length || 0} plants suitable</p>
    </Link>
  )
}
