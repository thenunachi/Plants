/**
 * Determine a PlantWise climate zone from latitude + longitude.
 * Uses Köppen-inspired rules — accurate enough for a gardening app.
 */

export const ZONE_META = {
  'Tropical': {
    emoji: '🌴',
    color: '#2d9e47',
    description: 'Hot and humid year-round. High rainfall, no frost.',
    tempRange: '20–35°C',
  },
  'Subtropical': {
    emoji: '🌞',
    color: '#f4a261',
    description: 'Warm with wet/dry seasons. Frost rare but possible.',
    tempRange: '15–30°C',
  },
  'Temperate': {
    emoji: '🍂',
    color: '#52b788',
    description: 'Four distinct seasons, moderate rainfall, mild frosts.',
    tempRange: '5–25°C',
  },
  'Mediterranean': {
    emoji: '🫒',
    color: '#e9c46a',
    description: 'Hot dry summers, mild wet winters. Coastal.',
    tempRange: '8–28°C',
  },
  'Arid / Desert': {
    emoji: '🏜️',
    color: '#e76f51',
    description: 'Very low rainfall, extreme heat by day, cold at night.',
    tempRange: '10–45°C',
  },
  'Alpine / Arctic': {
    emoji: '🏔️',
    color: '#74b9ff',
    description: 'Very cold, short growing season, frost year-round possible.',
    tempRange: '-10–15°C',
  },
}

export function getClimateZone(lat, lon) {
  const absLat = Math.abs(lat)

  // ── Arctic / Alpine ──────────────────────────────────────
  if (absLat >= 62) return 'Alpine / Arctic'

  // ── Tropical ─────────────────────────────────────────────
  if (absLat < 15) return 'Tropical'

  // ── Subtropical band (15–25°) ────────────────────────────
  if (absLat < 25) return 'Subtropical'

  // ── Known arid / desert cores (25–38°) ───────────────────
  if (absLat >= 15 && absLat <= 38) {
    // Sahara + Arabian Peninsula
    if (lon >= -15 && lon <= 60 && lat > 15 && lat < 35) return 'Arid / Desert'
    // Iranian Plateau / Central Asian desert
    if (lon >= 50 && lon <= 75 && lat > 25 && lat < 38) return 'Arid / Desert'
    // Sonoran / Mojave (SW USA + NW Mexico)
    if (lon >= -120 && lon <= -100 && lat > 25 && lat < 38) return 'Arid / Desert'
    // Atacama (coastal Peru/Chile)
    if (lon >= -76 && lon <= -68 && lat > -28 && lat < -15) return 'Arid / Desert'
    // Australian outback
    if (lon >= 115 && lon <= 145 && lat < -20 && lat > -34) return 'Arid / Desert'
  }

  // ── Mediterranean pockets (30–45°, west-facing coasts) ───
  if (absLat >= 28 && absLat <= 46) {
    // Mediterranean basin proper
    if (lon >= -10 && lon <= 42 && lat > 28 && lat < 46) return 'Mediterranean'
    // California coast
    if (lon >= -125 && lon <= -117 && lat > 32 && lat < 42) return 'Mediterranean'
    // Central Chile
    if (lon >= -72 && lon <= -66 && lat < -30 && lat > -44) return 'Mediterranean'
    // SW Australia (Perth region)
    if (lon >= 114 && lon <= 122 && lat < -30 && lat > -36) return 'Mediterranean'
    // South Africa Cape
    if (lon >= 17 && lon <= 26 && lat < -28 && lat > -35) return 'Mediterranean'
  }

  // ── Subtropical (25–35°, moist eastern coasts) ───────────
  if (absLat >= 25 && absLat <= 35) {
    // SE USA (Florida, Gulf Coast, SE states)
    if (lon >= -100 && lon <= -75 && lat > 25 && lat < 35) return 'Subtropical'
    // E China / Korea / Japan south
    if (lon >= 108 && lon <= 135 && lat > 25 && lat < 35) return 'Subtropical'
    // NE Argentina / S Brazil / Uruguay
    if (lon >= -60 && lon <= -45 && lat < -22 && lat > -35) return 'Subtropical'
    // SE Australia (Sydney, Melbourne band)
    if (lon >= 140 && lon <= 152 && lat < -28 && lat > -38) return 'Subtropical'
    // South Asia (India Deccan plain south)
    if (lon >= 68 && lon <= 88 && lat > 15 && lat < 25) return 'Subtropical'
  }

  // ── Temperate (35–62°) ────────────────────────────────────
  // Everything else in the mid-latitudes defaults to Temperate
  if (absLat >= 35) return 'Temperate'

  // ── Fallback subtropical ─────────────────────────────────
  return 'Subtropical'
}

/**
 * For Seattle WA (47.6°N, 122.3°W):
 *   absLat = 47.6 → not Arctic, not tropical, not Sahara, not California Med,
 *   → hits Temperate ✓
 */
