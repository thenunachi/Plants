export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <span className="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search plants..."
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}
