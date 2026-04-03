import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-emoji">🌱</span>
        <span className="brand-text">PlantWise</span>
      </Link>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink>
        <NavLink to="/plants" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Plants</NavLink>
        <NavLink to="/regions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Regions</NavLink>
      </div>
    </nav>
  )
}
