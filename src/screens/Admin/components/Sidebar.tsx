// @ts-nocheck
import React from 'react'
import { LogOut } from 'lucide-react'

export default function Sidebar({ 
  brandName = "Northeast", 
  brandSub = "Admin", 
  user, 
  navItems, 
  onNavClick, 
  onLogout, 
  isOpen, 
  onClose,
  activeId
}) {
  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onClose} 
      />

      <aside 
        className={`dashboard-sidebar advocate-sidebar client-sidebar ${isOpen ? 'open' : ''}`} 
        style={{ transform: isOpen ? 'translateX(0)' : '' }}
      >
        <div className="sidebar-brand">
          <span className="brand-mark">L</span>
          <div>
            <strong>{brandName}</strong>
            <span>{brandSub}</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">✕</button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              className={`nav-item${activeId === item.id ? ' active' : ''} fade-up`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onNavClick(item.id)}
            >
              <span className="nav-icon-wrapper">{item.icon || <span className="nav-icon" />}</span>
              {item.label}
            </button>
          ))}
          <button 
            className="nav-item nav-logout fade-up" 
            style={{ animationDelay: '0.4s' }} 
            onClick={onLogout}
          >
            <span className="nav-icon-wrapper"><LogOut size={18} /></span> Logout
          </button>
        </nav>
      </aside>
    </>
  )
}
