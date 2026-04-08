import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { getClimateZone, ZONE_META } from '../utils/climateZone'
import { getWMO } from '../hooks/useWeather'

// Fix leaflet default marker icons broken by Vite bundler
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const difficultyColors = { easy: '#52b788', medium: '#f4a261', hard: '#e76f51' }

const CITY_SHORTCUTS = [
  { name: 'Seattle, WA', lat: 47.61, lon: -122.33 },
  { name: 'New York',    lat: 40.71, lon: -74.01  },
  { name: 'London',      lat: 51.51, lon: -0.13   },
  { name: 'Mumbai',      lat: 19.08, lon: 72.88   },
  { name: 'Tokyo',       lat: 35.68, lon: 139.69  },
  { name: 'Sydney',      lat: -33.87, lon: 151.21 },
  { name: 'Cairo',       lat: 30.04, lon: 31.24   },
  { name: 'São Paulo',   lat: -23.55, lon: -46.63 },
  { name: 'Cape Town',   lat: -33.93, lon: 18.42  },
  { name: 'Reykjavík',   lat: 64.13, lon: -21.95  },
]

// ── Click handler — must live inside <MapContainer> ──────────
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ── Fetch reverse geocode + weather for coords ───────────────
async function fetchLocationInfo(lat, lon) {
  const [weatherRes, geoRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,` +
      `relative_humidity_2m,wind_speed_10m,precipitation` +
      `&daily=temperature_2m_max,temperature_2m_min` +
      `&timezone=auto&forecast_days=7`
    ),
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'PlantWise-App' } }
    ),
  ])
  const weather = await weatherRes.json()
  const geo    = await geoRes.json()
  const addr   = geo.address || {}
  const city   = addr.city || addr.town || addr.village || addr.county || addr.state || 'Unknown'
  return {
    weather,
    city,
    state:   addr.state || '',
    country: addr.country || '',
  }
}

// ── Mini plant row in the side panel ────────────────────────
function MiniPlantCard({ plant }) {
  return (
    <Link to={`/plants/${plant.id}`} className="map-plant-card">
      <span className="map-plant-emoji">{plant.emoji}</span>
      <div className="map-plant-info">
        <div className="map-plant-name">{plant.name}</div>
        <div className="map-plant-meta">
          <span className="badge category" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
            {plant.category}
          </span>
          <span
            className="badge difficulty"
            style={{ fontSize: '0.68rem', padding: '2px 7px', background: difficultyColors[plant.difficulty] }}
          >
            {plant.difficulty}
          </span>
        </div>
        <div className="map-plant-temp">🌡️ {plant.temp_optimal}°C optimal</div>
      </div>
    </Link>
  )
}

// ── Side panel ───────────────────────────────────────────────
function LocationPanel({ data, onClose }) {
  const { lat, lon, city, state, country, weather, zone, plants, loadingPlants } = data
  const meta = ZONE_META[zone] || {}
  const wmo  = weather ? getWMO(weather.current.weather_code) : null

  const weekMin = weather?.daily?.temperature_2m_min?.length
    ? Math.min(...weather.daily.temperature_2m_min)
    : null
  const weekMax = weather?.daily?.temperature_2m_max?.length
    ? Math.max(...weather.daily.temperature_2m_max)
    : null

  // Group plants by category
  const byCategory = plants.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="map-panel">
      <button className="map-panel-close" onClick={onClose}>✕</button>

      {/* Location heading */}
      <div className="map-panel-location">
        <span className="map-panel-pin">📍</span>
        <div>
          <div className="map-panel-city">{city}</div>
          <div className="map-panel-country">
            {[state, country].filter(Boolean).join(', ')}
            &nbsp;·&nbsp;{parseFloat(lat).toFixed(2)}°,&nbsp;{parseFloat(lon).toFixed(2)}°
          </div>
        </div>
      </div>

      {/* Climate zone card */}
      <div className="map-zone-card" style={{ borderColor: meta.color, background: meta.color + '18' }}>
        <div className="map-zone-header">
          <span className="map-zone-emoji">{meta.emoji}</span>
          <div>
            <div className="map-zone-name" style={{ color: meta.color }}>{zone}</div>
            <div className="map-zone-temp">{meta.tempRange}</div>
          </div>
        </div>
        <p className="map-zone-desc">{meta.description}</p>
      </div>

      {/* Live weather */}
      {weather && wmo && (
        <div className="map-weather-strip">
          <div className="map-weather-main">
            <span className="map-weather-emoji">{wmo.emoji}</span>
            <span className="map-weather-temp">{Math.round(weather.current.temperature_2m)}°C</span>
            <span className="map-weather-cond">{wmo.label}</span>
          </div>
          <div className="map-weather-stats">
            <span>💧 {weather.current.relative_humidity_2m}%</span>
            <span>💨 {Math.round(weather.current.wind_speed_10m)} km/h</span>
            {weekMin !== null && (
              <span>📅 {Math.round(weekMin)}–{Math.round(weekMax)}°C this week</span>
            )}
          </div>
        </div>
      )}

      {/* Plants list */}
      <div className="map-plants-section">
        <h3 className="map-plants-title">
          🌿 Suitable Plants
          {!loadingPlants && (
            <span className="map-plants-count">{plants.length} plants</span>
          )}
        </h3>

        {loadingPlants ? (
          <div className="map-plants-loading">
            <div className="loading-spinner" style={{ width: 28, height: 28 }} />
            <span>Loading plants...</span>
          </div>
        ) : plants.length === 0 ? (
          <p className="map-plants-empty">No plants found for this region yet.</p>
        ) : (
          Object.entries(byCategory).map(([cat, catPlants]) => (
            <div key={cat} className="map-category-group">
              <div className="map-category-label">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}s
                <span className="map-category-count">{catPlants.length}</span>
              </div>
              <div className="map-plant-list">
                {catPlants.map(p => <MiniPlantCard key={p.id} plant={p} />)}
              </div>
            </div>
          ))
        )}
      </div>

      <Link to="/regions" className="map-view-region-btn">
        View Full Region Guide →
      </Link>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function MapExplorer() {
  const [pin, setPin]             = useState(null)   // { lat, lon }
  const [panelData, setPanelData] = useState(null)
  const [locating, setLocating]   = useState(false)

  const handleCoords = useCallback(async (lat, lon) => {
    // Show pin immediately with loading state
    setPin({ lat, lon })
    setPanelData({
      lat, lon,
      city: '…', state: '', country: '',
      weather: null,
      zone: getClimateZone(lat, lon),
      plants: [],
      loadingPlants: true,
    })

    const zone = getClimateZone(lat, lon)

    try {
      const [locInfo, plantsRes] = await Promise.all([
        fetchLocationInfo(lat, lon),
        axios.get('/api/plants', { params: { region: zone } }),
      ])

      setPanelData({
        lat, lon,
        city:    locInfo.city,
        state:   locInfo.state,
        country: locInfo.country,
        weather: locInfo.weather,
        zone,
        plants:       plantsRes.data,
        loadingPlants: false,
      })
    } catch (err) {
      setPanelData(prev => prev ? { ...prev, loadingPlants: false } : prev)
    }
  }, [])

  const handleMapClick = useCallback((lat, lng) => {
    handleCoords(lat, lng)
  }, [handleCoords])

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false)
        handleCoords(coords.latitude, coords.longitude)
      },
      () => setLocating(false),
      { timeout: 10000 }
    )
  }

  return (
    <div className="map-explorer">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <h1>🗺️ Plant Region Explorer</h1>
          <p>
            Click anywhere on the map to discover which plants grow best there,
            the local climate zone, and live weather conditions.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="map-controls">
        <button
          className="map-locate-btn"
          onClick={handleMyLocation}
          disabled={locating}
        >
          {locating ? '📡 Locating...' : '📍 Use My Location'}
        </button>
        <div className="map-shortcuts">
          <span className="map-shortcuts-label">Quick jump:</span>
          {CITY_SHORTCUTS.map(c => (
            <button
              key={c.name}
              className="map-shortcut-btn"
              onClick={() => handleCoords(c.lat, c.lon)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Panel */}
      <div className={`map-layout ${panelData ? 'map-layout-split' : ''}`}>
        <div className="map-container-wrap">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={10}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            className="leaflet-map"
            worldCopyJump={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              noWrap={true}
            />

            {/* Must be inside MapContainer */}
            <ClickHandler onMapClick={handleMapClick} />

            {pin && (
              <Marker position={[pin.lat, pin.lon]}>
                <Popup>
                  {panelData?.zone ? (
                    <div style={{ fontFamily: 'Nunito, sans-serif', minWidth: 140, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.6rem' }}>{ZONE_META[panelData.zone]?.emoji}</div>
                      <div style={{ fontWeight: 800, marginTop: 4 }}>{panelData.city}</div>
                      <div style={{ color: ZONE_META[panelData.zone]?.color, fontWeight: 700, fontSize: '0.85rem' }}>
                        {panelData.zone}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.78rem', marginTop: 4 }}>
                        {panelData.plants.length} suitable plants
                      </div>
                    </div>
                  ) : (
                    <span>Loading...</span>
                  )}
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {!pin && (
            <div className="map-hint">
              👆 Click anywhere on the map to explore plants for that region
            </div>
          )}
        </div>

        {panelData && (
          <LocationPanel
            data={panelData}
            onClose={() => { setPanelData(null); setPin(null) }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="map-legend">
        <span className="map-legend-title">Climate Zones:</span>
        {Object.entries(ZONE_META).map(([zone, meta]) => (
          <div key={zone} className="map-legend-item">
            <span className="map-legend-dot" style={{ background: meta.color }} />
            <span>{meta.emoji} {zone}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
