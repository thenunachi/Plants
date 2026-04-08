import { useWeather, getWMO } from '../hooks/useWeather'

function getPlantingStatus(temp, plant) {
  if (temp === null || temp === undefined) return null
  const { temp_min, temp_max, temp_optimal } = plant

  if (temp < temp_min) {
    const diff = Math.abs(Math.round(temp - temp_min))
    return {
      status: 'danger',
      icon: '❌',
      label: 'Too Cold',
      color: '#74b9ff',
      bg: '#ebf5ff',
      message: `Current temperature (${Math.round(temp)}°C) is ${diff}°C below this plant's minimum of ${temp_min}°C. Planting now would damage or kill seedlings.`,
      advice: `Wait until temperatures consistently exceed ${temp_min}°C. Consider starting indoors or using a cloche/frost protection.`,
    }
  }
  if (temp > temp_max) {
    const diff = Math.abs(Math.round(temp - temp_max))
    return {
      status: 'danger',
      icon: '🔥',
      label: 'Too Hot',
      color: '#e76f51',
      bg: '#fff5f0',
      message: `Current temperature (${Math.round(temp)}°C) is ${diff}°C above this plant's maximum of ${temp_max}°C. Heat stress would affect germination and growth.`,
      advice: `Provide afternoon shade, mulch heavily, and water frequently. Wait for cooler weather or grow a heat-tolerant variety.`,
    }
  }

  const diff = Math.abs(temp - temp_optimal)
  if (diff <= 3) {
    return {
      status: 'perfect',
      icon: '✅',
      label: 'Perfect Conditions',
      color: '#2d6a4f',
      bg: '#f0fff4',
      message: `Current temperature (${Math.round(temp)}°C) is ideal — very close to the optimal of ${temp_optimal}°C. This is a great time to plant!`,
      advice: `Go for it! Ensure soil is prepared, watered, and that there is no frost forecast in the next 7 days.`,
    }
  }
  if (temp < temp_optimal) {
    return {
      status: 'caution',
      icon: '⚠️',
      label: 'Slightly Cool',
      color: '#f4a261',
      bg: '#fffbf0',
      message: `Current temperature (${Math.round(temp)}°C) is within the safe range but ${Math.round(temp_optimal - temp)}°C below the optimal of ${temp_optimal}°C. Growth may be slower than ideal.`,
      advice: `Planting is possible but expect slower germination. Use a black plastic mulch to warm the soil, or wait a few weeks.`,
    }
  }
  return {
    status: 'caution',
    icon: '⚠️',
    label: 'Slightly Warm',
    color: '#f4a261',
    bg: '#fffbf0',
    message: `Current temperature (${Math.round(temp)}°C) is within the safe range but ${Math.round(temp - temp_optimal)}°C above the optimal of ${temp_optimal}°C. Watch for heat stress.`,
    advice: `Plant in the early morning or evening. Mulch well, water deeply, and provide shade cloth if temperatures spike.`,
  }
}

function TempRangeBar({ temp, plant }) {
  const globalMin = -25
  const globalMax = 55
  const range = globalMax - globalMin
  const toP = (v) => `${Math.max(0, Math.min(100, ((v - globalMin) / range) * 100))}%`

  return (
    <div className="advisor-temp-bar">
      <div className="advisor-temp-track">
        {/* safe zone highlight */}
        <div
          className="advisor-safe-zone"
          style={{
            left: toP(plant.temp_min),
            width: `calc(${toP(plant.temp_max)} - ${toP(plant.temp_min)})`,
          }}
        />
        {/* optimal marker */}
        <div className="advisor-marker optimal-marker" style={{ left: toP(plant.temp_optimal) }}>
          <div className="advisor-marker-dot" style={{ background: '#2d6a4f' }} />
          <span className="advisor-marker-label">{plant.temp_optimal}°C optimal</span>
        </div>
        {/* current temp marker */}
        {temp !== null && (
          <div className="advisor-marker current-marker" style={{ left: toP(temp) }}>
            <div className="advisor-marker-dot" style={{ background: '#e76f51', width: 20, height: 20 }} />
            <span className="advisor-marker-label" style={{ color: '#e76f51', fontWeight: 800 }}>
              {Math.round(temp)}°C now
            </span>
          </div>
        )}
      </div>
      <div className="advisor-temp-legend">
        <span>Cold ({globalMin}°C)</span>
        <span>Moderate (15°C)</span>
        <span>Hot ({globalMax}°C)</span>
      </div>
    </div>
  )
}

export default function PlantingAdvisor({ plant }) {
  const { weather, location, loading, error, denied } = useWeather()

  if (denied) {
    return (
      <div className="detail-section">
        <h2>🌤️ Is Now a Good Time to Plant?</h2>
        <div className="advisor-denied">
          <span>📍</span>
          <div>
            <strong>Location access denied</strong>
            <p>Enable location access in your browser settings to get personalised planting advice based on your current weather.</p>
          </div>
        </div>
      </div>
    )
  }

  const temp = weather?.current?.temperature_2m ?? null
  const status = getPlantingStatus(temp, plant)
  const wmo = weather ? getWMO(weather.current.weather_code) : null

  // 7-day low/high for frost warning
  const weekMin = weather?.daily?.temperature_2m_min
    ? Math.min(...weather.daily.temperature_2m_min)
    : null
  const frostWarning = weekMin !== null && weekMin < plant.temp_min

  return (
    <div className="detail-section">
      <h2>🌤️ Is Now a Good Time to Plant?</h2>

      {loading && (
        <div className="advisor-loading">
          <div className="weather-spinner" />
          <span>Getting your local weather...</span>
        </div>
      )}

      {error && (
        <div className="advisor-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {!loading && !error && weather && status && (
        <>
          {/* Location + current condition row */}
          <div className="advisor-header">
            <div className="advisor-location">
              <span>📍</span>
              <span><strong>{location?.city}</strong>, {location?.country}</span>
            </div>
            <div className="advisor-current-cond">
              <span>{wmo?.emoji}</span>
              <span>{Math.round(temp)}°C · {wmo?.label}</span>
            </div>
          </div>

          {/* Status card */}
          <div className="advisor-status-card" style={{ background: status.bg, borderColor: status.color }}>
            <div className="advisor-status-header">
              <span className="advisor-status-icon">{status.icon}</span>
              <span className="advisor-status-label" style={{ color: status.color }}>{status.label}</span>
            </div>
            <p className="advisor-status-message">{status.message}</p>
            <div className="advisor-advice">
              <span className="advisor-advice-icon">💡</span>
              <span>{status.advice}</span>
            </div>
          </div>

          {/* Frost warning */}
          {frostWarning && (
            <div className="advisor-frost-warning">
              <span>❄️</span>
              <div>
                <strong>Frost risk in next 7 days</strong>
                <p>
                  The 7-day forecast shows a low of {Math.round(weekMin)}°C — below this plant's minimum of {plant.temp_min}°C.
                  Protect seedlings with a cloche, cold frame, or fleece.
                </p>
              </div>
            </div>
          )}

          {/* Temperature bar */}
          <h4 className="advisor-bar-title">Temperature Range vs. Current Conditions</h4>
          <TempRangeBar temp={temp} plant={plant} />

          {/* Weather stats row */}
          <div className="advisor-stats">
            <div className="advisor-stat">
              <span>💧</span>
              <span className="aw-val">{weather.current.relative_humidity_2m}%</span>
              <span className="aw-label">Humidity</span>
            </div>
            <div className="advisor-stat">
              <span>💨</span>
              <span className="aw-val">{Math.round(weather.current.wind_speed_10m)} km/h</span>
              <span className="aw-label">Wind</span>
            </div>
            <div className="advisor-stat">
              <span>🌧️</span>
              <span className="aw-val">{weather.current.precipitation} mm</span>
              <span className="aw-label">Precipitation</span>
            </div>
            <div className="advisor-stat">
              <span>📅</span>
              <span className="aw-val">{Math.round(weekMin)}°C</span>
              <span className="aw-label">7-day Low</span>
            </div>
          </div>

          <p className="advisor-source">
            Weather data from <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> · No API key required · Updates on page load
          </p>
        </>
      )}
    </div>
  )
}
