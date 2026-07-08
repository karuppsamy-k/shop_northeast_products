// @ts-nocheck
export default function StatCard({ title, value, detail, badge, onClick }) {
  return (
    <div 
      className={`stat-card fade-up ${onClick ? 'interactive-card' : ''}`} 
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {badge && <span className="stat-card-badge">{badge}</span>}
      </div>
      <strong className="stat-card-value">{value}</strong>
      <p className="stat-card-detail">{detail}</p>
    </div>
  )
}
