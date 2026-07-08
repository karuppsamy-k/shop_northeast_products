// @ts-nocheck
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import './admin.css'
import { useThemeStore } from '../../store/themeStore'
import TopBar from './components/TopBar'
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import {
  Users, MapPin, Clock, Bike, Truck, Info, CreditCard,
  ShoppingBag, AlertCircle, Phone, Globe, QrCode
} from 'lucide-react'



// ─── Main Users Page ──────────────────────────────────────────────────────────
export default function UsersPage() {
  const context = useOutletContext<{ sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }>()
  const sidebarOpen = context?.sidebarOpen || false
  const setSidebarOpen = context?.setSidebarOpen || (() => {})
  const { theme } = useThemeStore()

  const [userList, setUserList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // ── Real-time Firebase listener ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
      setUserList(fetched)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleRemove = async (uid: string) => {
    if (window.confirm('Remove this user from the platform?')) {
      await deleteDoc(doc(db, 'users', uid))
    }
  }

  const filtered = userList.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  const avatarColor = (name = '') => {
    const colors = [
      'linear-gradient(135deg,#a855f7,#6c9cff)',
      'linear-gradient(135deg,#4ce1b1,#6c9cff)',
      'linear-gradient(135deg,#f97316,#fcd34d)',
      'linear-gradient(135deg,#f87171,#fb923c)',
      'linear-gradient(135deg,#818cf8,#a855f7)',
    ]
    return colors[name.charCodeAt(0) % colors.length] || colors[0]
  }

  const initials = (name = '') =>
    name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase()).join('')

  return (
    <>
      <TopBar
        title="Users & Store Info"
        subtitle="MANAGEMENT"
        isSidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
        actions={
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{
              padding: '4px 10px',
              background: 'rgba(76,225,177,0.12)',
              color: '#4ce1b1',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid rgba(76,225,177,0.2)'
            }}>
              {userList.length} users
            </span>
          </div>
        }
      />

      <div style={{ height: '16px' }} />

      {/* ── USERS ── */}
      <section className="dashboard-grid fade-up">
          <article className="panel" style={{ gridColumn: '1 / -1' }}>
            {/* Header */}
            <div className="panel-header">
              <div>
                <h2>User Directory</h2>
                <p>Live from Firebase — {filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
              </div>
              <input
                type="search"
                placeholder="🔍 Search name, email, phone…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="modal-input"
                style={{ maxWidth: 240, padding: '7px 12px', fontSize: '13px' }}
              />
            </div>

            {/* User Cards — compact mobile-first */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9aa6d2' }}>
                  <span style={{ fontSize: '24px' }}>⏳</span>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>Loading from Firebase…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9aa6d2' }}>
                  <span style={{ fontSize: '32px' }}>🙅</span>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>No users found.</p>
                </div>
              ) : (
                filtered.map((u, idx) => (
                  <div
                    key={u.uid}
                    onClick={() => setSelectedUser(selectedUser?.uid === u.uid ? null : u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom: idx < filtered.length - 1
                        ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      background: selectedUser?.uid === u.uid
                        ? 'rgba(108,156,255,0.07)' : 'transparent',
                    }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '10px',
                      background: avatarColor(u.name),
                      display: 'grid', placeItems: 'center',
                      color: '#fff', fontSize: '14px', fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {initials(u.name)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.email}
                      </div>
                      {/* Expanded Detail */}
                      {selectedUser?.uid === u.uid && (
                        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {u.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#9aa6d2' }}>
                              <Phone size={11} /> {u.phone}
                            </div>
                          )}
                          {u.role && (
                            <div style={{ fontSize: '11px', background: 'rgba(108,156,255,0.12)', color: '#6c9cff', borderRadius: '4px', padding: '2px 7px', display: 'inline-block', fontWeight: 700 }}>
                              {u.role}
                            </div>
                          )}
                          {u.createdAt && (
                            <div style={{ fontSize: '11px', color: '#9aa6d2' }}>
                              Joined: {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {u.address && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#9aa6d2' }}>
                              <MapPin size={11} style={{ marginTop: 2, flexShrink: 0 }} /> {u.address}
                            </div>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); handleRemove(u.uid) }}
                            style={{
                              marginTop: '6px',
                              padding: '5px 12px',
                              background: 'rgba(248,113,113,0.12)',
                              color: '#f87171',
                              border: '1px solid rgba(248,113,113,0.25)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              alignSelf: 'flex-start',
                            }}
                          >
                            Remove User
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Role Badge + chevron */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <div style={{
                        padding: '3px 9px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: u.role === 'admin'
                          ? 'rgba(168,85,247,0.15)'
                          : 'rgba(76,225,177,0.12)',
                        color: u.role === 'admin' ? '#a855f7' : '#4ce1b1',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(168,85,247,0.25)' : 'rgba(76,225,177,0.2)'}`,
                        textTransform: 'capitalize',
                      }}>
                        {u.role || 'user'}
                      </div>
                      <span style={{ fontSize: '10px', color: '#9aa6d2' }}>
                        {selectedUser?.uid === u.uid ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>
    </>
  )
}
