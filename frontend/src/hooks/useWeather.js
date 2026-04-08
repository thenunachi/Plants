import { useState, useEffect } from 'react'

// WMO Weather Code → { label, emoji }
const WMO_CODES = {
  0:  { label: 'Clear Sky',            emoji: '☀️' },
  1:  { label: 'Mainly Clear',         emoji: '🌤️' },
  2:  { label: 'Partly Cloudy',        emoji: '⛅' },
  3:  { label: 'Overcast',             emoji: '☁️' },
  45: { label: 'Fog',                  emoji: '🌫️' },
  48: { label: 'Icy Fog',              emoji: '🌫️' },
  51: { label: 'Light Drizzle',        emoji: '🌦️' },
  53: { label: 'Moderate Drizzle',     emoji: '🌦️' },
  55: { label: 'Dense Drizzle',        emoji: '🌧️' },
  61: { label: 'Slight Rain',          emoji: '🌧️' },
  63: { label: 'Moderate Rain',        emoji: '🌧️' },
  65: { label: 'Heavy Rain',           emoji: '🌧️' },
  71: { label: 'Slight Snow',          emoji: '🌨️' },
  73: { label: 'Moderate Snow',        emoji: '❄️' },
  75: { label: 'Heavy Snow',           emoji: '❄️' },
  77: { label: 'Snow Grains',          emoji: '🌨️' },
  80: { label: 'Slight Showers',       emoji: '🌦️' },
  81: { label: 'Moderate Showers',     emoji: '🌧️' },
  82: { label: 'Violent Showers',      emoji: '⛈️' },
  85: { label: 'Slight Snow Showers',  emoji: '🌨️' },
  86: { label: 'Heavy Snow Showers',   emoji: '🌨️' },
  95: { label: 'Thunderstorm',         emoji: '⛈️' },
  96: { label: 'Thunderstorm + Hail',  emoji: '⛈️' },
  99: { label: 'Thunderstorm + Hail',  emoji: '⛈️' },
}

export function getWMO(code) {
  return WMO_CODES[code] || { label: 'Unknown', emoji: '🌡️' }
}

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast` +
              `?latitude=${latitude}&longitude=${longitude}` +
              `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
              `weather_code,wind_speed_10m,precipitation,uv_index` +
              `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
              `&timezone=auto&forecast_days=7`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { 'Accept-Language': 'en', 'User-Agent': 'PlantWise-App' } }
            ),
          ])

          const weatherData = await weatherRes.json()
          const geoData = await geoRes.json()

          const addr = geoData.address || {}
          const city =
            addr.city || addr.town || addr.village ||
            addr.county || addr.state || 'Your Location'

          setWeather({
            current: weatherData.current,
            daily: weatherData.daily,
          })
          setLocation({
            lat: latitude.toFixed(2),
            lon: longitude.toFixed(2),
            city,
            country: addr.country || '',
          })
        } catch {
          setError('Could not fetch weather data. Check your connection.')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        if (err.code === 1) setDenied(true)
        else setError('Could not determine your location.')
        setLoading(false)
      },
      { timeout: 12000 }
    )
  }, [])

  return { weather, location, loading, error, denied }
}
