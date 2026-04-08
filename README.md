# 🌱 Plan-t Ahead — Grow the Right Plant, in the Right Place

A full-stack informational web app for gardeners and growers. Discover which plants thrive in your climate, get live weather-based planting advice, explore an interactive world map by region, and ask an AI about any plant you have in mind.

---

## Features

### 🌍 Plant Encyclopedia
- 20+ pre-seeded plants covering vegetables, fruits, grains, herbs, flowers, and succulents
- Filter by category, difficulty (easy / medium / hard), and keyword search
- Each plant has a full detail page with:
  - Germination and fruit-bearing timelines
  - Temperature range with a visual colour-coded bar
  - Sunlight, water needs, soil type, and pH range
  - Planting calendar (Gantt-style — sow indoors → transplant → harvest)
  - Companion planting guide (friends, foes, pests & diseases)
  - Indoor/outdoor guide with overwintering instructions
  - Propagation methods and pruning tips
  - Live "Is Now a Good Time to Plant?" advisor powered by real weather

### 🗺️ Interactive World Map
- Click anywhere on the map to instantly see:
  - Climate zone (Tropical, Subtropical, Temperate, Mediterranean, Arid/Desert, Alpine/Arctic)
  - Live weather conditions (temperature, humidity, wind, precipitation)
  - 7-day temperature forecast
  - All plants suitable for that region, grouped by category
- "Use My Location" button for one-click local lookup
- Quick-jump shortcuts: Seattle, NYC, London, Mumbai, Tokyo, Sydney, Cairo, São Paulo, Cape Town, Reykjavík
- Single non-repeating world map with hard geographic bounds

### 🌤️ Live Weather Integration
- Powered by [Open-Meteo](https://open-meteo.com) — completely free, no API key required
- Reverse geocoding via [Nominatim](https://nominatim.org) (OpenStreetMap) — also free
- Home page weather widget shows current conditions + 7-day forecast for your location
- Plant detail page advisor compares live temperature against the plant's safe range and gives specific advice (perfect / slightly cool / slightly warm / too cold / too hot)
- Frost warning if the 7-day forecast dips below a plant's minimum temperature

### ✨ AI Plant Search (Groq)
- Type any plant name (cilantro, jasmine, fig, turmeric, etc.)
- Groq's `llama-3.3-70b-versatile` model generates a complete plant profile in structured JSON
- The plant is saved permanently to the database and immediately appears in all filters, region pages, and the map explorer
- Suggestion chips for quick one-click searches
- If the plant already exists in the database it returns the saved record instantly (no wasted API calls)

### 🌿 Climate Regions
- 6 climate regions with descriptions, temperature ranges, and frost dates:
  - Tropical · Subtropical · Temperate · Mediterranean · Arid/Desert · Alpine/Arctic
- Each region page shows all suitable plants grouped by category

### 📱 Fully Responsive
- Desktop — side-by-side map + panel, full navigation bar
- Tablet — hamburger menu, stacked map layout, horizontally scrolling controls
- Mobile — compact map (40vh), scrollable bottom-sheet panel, stacked inputs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Map | Leaflet, react-leaflet v4 |
| Styling | Pure CSS with custom properties (no framework) |
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-CORS |
| Database | SQLite (via SQLAlchemy ORM) |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Weather | Open-Meteo (free, no key) |
| Geocoding | Nominatim / OpenStreetMap (free, no key) |

---

## Project Structure

```
plantsApp/
├── backend/
│   ├── models/
│   │   ├── __init__.py          # SQLAlchemy db instance
│   │   └── plant.py             # Plant + Region models (many-to-many)
│   ├── routes/
│   │   ├── plants.py            # REST API: /api/plants, /api/regions, /api/stats
│   │   └── ai.py                # POST /api/ask — Groq AI plant generation
│   ├── seeds/
│   │   └── seed_plants.py       # Seeds 20 plants across 6 climate regions
│   ├── app.py                   # Flask app factory
│   ├── config.py                # SQLite + Groq key config
│   ├── requirements.txt
│   └── .env                     # API_KEY=your_groq_key
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx           # Responsive nav with hamburger menu
    │   │   ├── PlantCard.jsx        # Plant grid card
    │   │   ├── RegionCard.jsx       # Region grid card
    │   │   ├── SearchBar.jsx        # Search input
    │   │   ├── WeatherWidget.jsx    # Home page weather + 7-day forecast
    │   │   ├── PlantingAdvisor.jsx  # Per-plant live weather advisor
    │   │   └── PlantAISearch.jsx    # AI plant search + preview card
    │   ├── hooks/
    │   │   └── useWeather.js        # Geolocation + Open-Meteo + Nominatim hook
    │   ├── pages/
    │   │   ├── Home.jsx             # Landing page
    │   │   ├── Plants.jsx           # Searchable / filterable plant list
    │   │   ├── PlantDetail.jsx      # Full plant profile
    │   │   ├── Regions.jsx          # All climate regions
    │   │   ├── RegionDetail.jsx     # Region + suitable plants
    │   │   └── MapExplorer.jsx      # Interactive world map
    │   ├── utils/
    │   │   └── climateZone.js       # Lat/lon → climate zone classifier
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd plantsApp
```

### 2. Backend setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create your .env file
echo 'API_KEY="your_groq_api_key_here"' > .env

# Seed the database (creates plants.db with 20 plants + 6 regions)
python seeds/seed_plants.py

# Start the Flask server (runs on port 5001)
python app.py
```

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (runs on port 3000)
npm run dev
```

### 4. Open the app

```
http://localhost:3000
```

The Vite dev server proxies all `/api` requests to `http://localhost:5001` automatically.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/plants` | List plants. Query params: `category`, `difficulty`, `region`, `search` |
| GET | `/api/plants/:id` | Single plant with full detail |
| GET | `/api/regions` | All regions with their plants |
| GET | `/api/regions/:id` | Single region with plants |
| GET | `/api/categories` | Distinct plant categories |
| GET | `/api/stats` | Total counts by category |
| POST | `/api/ask` | AI plant lookup/generation. Body: `{ "plant_name": "cilantro" }` |

---

## External Services

| Service | Used For | Cost | Key Required |
|---|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Weather + 7-day forecast | Free | No |
| [Nominatim](https://nominatim.org) | Reverse geocoding (coords → city) | Free | No |
| [Groq](https://console.groq.com) | AI plant profile generation | Free tier available | Yes |
| [OpenStreetMap](https://www.openstreetmap.org) | Map tiles | Free | No |

---

## Re-seeding the Database

If you update the seed file or the model schema, drop and recreate the database:

```bash
cd backend
python seeds/seed_plants.py
```

> This drops all tables and re-creates them. Any plants added via AI search will be lost. Run this only when you need a clean reset.

---

## Environment Variables

Create `backend/.env`:

```env
API_KEY="gsk_your_groq_api_key_here"
```

No other environment variables are required. The frontend uses Vite's built-in proxy so no `.env` is needed there.
