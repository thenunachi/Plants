import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [dark, toggleTheme] = useDarkMode()

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={() => setOpen(false)}>
        <span className="brand-emoji">🌱</span>
        <span className="brand-text">Plan-t Ahead</span>
      </Link>

      {/* Desktop links */}
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        <NavLink to="/plants" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Plants</NavLink>
        <NavLink to="/regions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Regions</NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>🗺️ Map</NavLink>
        <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>📅 Calendar</NavLink>
        <NavLink to="/garden" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>🪴 My Garden</NavLink>
      </div>

      {/* Dark mode toggle */}
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
        {dark ? '☀️' : '🌙'}
      </button>

      {/* Hamburger button — mobile only */}
      <button
        className={`nav-hamburger ${open ? 'nav-hamburger-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="nav-mobile-menu">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-mobile-link active' : 'nav-mobile-link'} onClick={() => setOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/plants" className={({ isActive }) => isActive ? 'nav-mobile-link active' : 'nav-mobile-link'} onClick={() => setOpen(false)}>🌿 Plants</NavLink>
          <NavLink to="/regions" className={({ isActive }) => isActive ? 'nav-mobile-link active' : 'nav-mobile-link'} onClick={() => setOpen(false)}>🌍 Regions</NavLink>
          <NavLink to="/map" className={({ isActive }) => isActive ? 'nav-mobile-link active' : 'nav-mobile-link'} onClick={() => setOpen(false)}>🗺️ Map</NavLink>
          <NavLink to="/calendar" className={({ isActive }) => isActive ? 'nav-mobile-link active' : 'nav-mobile-link'} onClick={() => setOpen(false)}>📅 Calendar</NavLink>
          <NavLink to="/garden" className={({ isActive }) => isActive ? 'nav-mobile-link active' : 'nav-mobile-link'} onClick={() => setOpen(false)}>🪴 My Garden</NavLink>
        </div>
      )}
    </nav>
  )
}
