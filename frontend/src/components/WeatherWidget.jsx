import { useWeather, getWMO } from '../hooks/useWeather'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getUVLabel(uv) {
  if (uv == null) return { label: 'N/A', color: '#aaa' }
  if (uv <= 2) return { label: 'Low', color: '#52b788' }
  if (uv <= 5) return { label: 'Moderate', color: '#f9c74f' }
  if (uv <= 7) return { label: 'High', color: '#f4a261' }
  if (uv <= 10) return { label: 'Very High', color: '#e76f51' }
  return { label: 'Extreme', color: '#9b2226' }
}

export default function WeatherWidget() {
  const { weather, location, loading, error, denied } = useWeather()

  if (denied) {
    return (
      <div className="weather-widget weather-denied">
        <span className="weather-denied-icon">📍</span>
        <div>
          <strong>Location access denied</strong>
          <p>Allow location access in your browser to see local weather and planting advice.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="weather-widget weather-loading">
        <div className="weather-spinner" />
        <span>Fetching your local weather...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="weather-widget weather-error">
        <span>⚠️</span>
        <span>{error}</span>
      </div>
    )
  }

  if (!weather) return null

  const { current, daily } = weather
  const wmo = getWMO(current.weather_code)
  const uv = getUVLabel(current.uv_index)

  // Build 7-day forecast
  const forecast = daily?.time?.map((date, i) => {
    const d = new Date(date)
    return {
      day: DAYS[d.getUTCDay()],
      tmax: Math.round(daily.temperature_2m_max[i]),
      tmin: Math.round(daily.temperature_2m_min[i]),
      rain: daily.precipitation_sum[i],
    }
  }) || []

  return (
    <div className="weather-widget">
      {/* Header */}
      <div className="weather-header">
        <div className="weather-location">
          <span className="weather-pin">📍</span>
          <div>
            <div className="weather-city">{location?.city}</div>
            <div className="weather-country">{location?.country} · {location?.lat}°, {location?.lon}°</div>
          </div>
        </div>
        <div className="weather-source">
          Powered by <a href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a>
        </div>
      </div>

      {/* Current conditions */}
      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-emoji">{wmo.emoji}</span>
          <div>
            <div className="weather-temp">{Math.round(current.temperature_2m)}°C</div>
            <div className="weather-condition">{wmo.label}</div>
            <div className="weather-feels">Feels like {Math.round(current.apparent_temperature)}°C</div>
          </div>
        </div>

        <div className="weather-stats">
          <div className="weather-stat">
            <span className="ws-icon">💧</span>
            <span className="ws-value">{current.relative_humidity_2m}%</span>
            <span className="ws-label">Humidity</span>
          </div>
          <div className="weather-stat">
            <span className="ws-icon">💨</span>
            <span className="ws-value">{Math.round(current.wind_speed_10m)} km/h</span>
            <span className="ws-label">Wind</span>
          </div>
          <div className="weather-stat">
            <span className="ws-icon">🌧️</span>
            <span className="ws-value">{current.precipitation} mm</span>
            <span className="ws-label">Precipitation</span>
          </div>
          <div className="weather-stat">
            <span className="ws-icon">🔆</span>
            <span className="ws-value" style={{ color: uv.color }}>{uv.label}</span>
            <span className="ws-label">UV Index</span>
          </div>
        </div>
      </div>

      {/* 7-day forecast */}
      {forecast.length > 0 && (
        <div className="weather-forecast">
          {forecast.map((f, i) => (
            <div key={i} className="forecast-day">
              <span className="forecast-day-name">{i === 0 ? 'Today' : f.day}</span>
              <span className="forecast-rain">{f.rain > 0 ? `🌧️ ${f.rain}mm` : '—'}</span>
              <span className="forecast-tmax">{f.tmax}°</span>
              <span className="forecast-tmin">{f.tmin}°</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
