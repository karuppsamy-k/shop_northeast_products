// @ts-nocheck
import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import './admin.css'
import { useThemeStore } from '../../store/themeStore'
import TopBar from './components/TopBar'
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'
import {
  Users, MapPin, Clock, Bike, Truck, Info, CreditCard,
  ShoppingBag, AlertCircle, Phone, Globe, QrCode, Filter, Shield, ShieldOff, Check
} from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';

// ─── Main Users Page ──────────────────────────────────────────────────────────
export default function UsersPage() {
  const context = useOutletContext<{ sidebarOpen: boolean, setSidebarOpen: (b: boolean) => void }>()
  const sidebarOpen = context?.sidebarOpen || false
  const setSidebarOpen = context?.setSidebarOpen || (() => {})
  const { theme } = useThemeStore()

  const [userList, setUserList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'All' | 'Admin' | 'User' | 'Removed'>('All')

  // ── Real-time Firebase listener ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))
      setUserList(fetched)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const handleRemove = async (u: any) => {
    const action = u.isRemoved ? 'Restore' : 'Remove';
    if (window.confirm(`${action} this user?`)) {
      try {
        await updateDoc(doc(db, 'users', u.uid), { isRemoved: !u.isRemoved });
      } catch (e) {
        console.error("Failed to update user", e);
      }
    }
  }

  const handleHardDelete = async (uid: string) => {
    if (window.confirm('Permanently delete this user? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (e) {
        console.error("Failed to delete user", e);
      }
    }
  }

  const filtered = userList.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
                          u.email?.toLowerCase().includes(search.toLowerCase()) ||
                          u.phone?.includes(search);
                          
    if (!matchesSearch) return false;
    
    if (activeTab === 'All') return !u.isRemoved;
    if (activeTab === 'Admin') return !u.isRemoved && u.role === 'admin';
    if (activeTab === 'User') return !u.isRemoved && u.role !== 'admin';
    if (activeTab === 'Removed') return !!u.isRemoved;
    return true;
  });

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
              {userList.filter(u => !u.isRemoved).length} active users
            </span>
          </div>
        }
      />
      
      {/* ── Category Chips ── */}
      <div className="mt-6 mb-2">
        <div className="flex items-center gap-3 bg-[var(--color-surface)] p-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
          <Filter className="w-5 h-5 text-[var(--color-muted-fg)] ml-2 shrink-0" />
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-1 pr-2 w-full">
            {['All', 'Admin', 'User', 'Removed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-muted-fg)] hover:text-[var(--color-fg)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="border-[var(--color-border)] overflow-hidden mt-4" style={{ background: 'var(--color-card)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--color-surface)]">
          <div>
            <h3 className="text-xl font-bold text-[var(--color-fg)]">User Directory</h3>
            <p className="text-sm text-[var(--color-muted-fg)]">Live from Firebase — {filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <input
            type="search"
            placeholder="🔍 Search name, email, phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-black/5 dark:bg-black/30 text-[var(--color-fg)] rounded-lg py-2 px-4 outline-none border border-[var(--color-border)] focus:border-primary w-full md:w-64"
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/5 dark:bg-black/20 border-b border-[var(--color-border)]">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">User</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Role</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Phone</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Address</TableHead>
                <TableHead className="text-[var(--color-muted-fg)] font-medium py-4">Joined</TableHead>
                <TableHead className="text-right text-[var(--color-muted-fg)] font-medium py-4 pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[var(--color-muted-fg)]">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(u => (
                  <TableRow key={u.uid} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/[0.05] transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div style={{
                          width: 36, height: 36, borderRadius: '10px',
                          background: avatarColor(u.name), display: 'grid', placeItems: 'center',
                          color: '#fff', fontSize: '13px', fontWeight: 800, flexShrink: 0
                        }}>
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className={`font-medium text-[var(--color-fg)] text-sm ${u.isRemoved ? 'line-through opacity-50' : ''}`}>{u.name || 'Unknown'}</p>
                          <p className="text-xs text-[var(--color-muted-fg)]">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {u.role || 'user'}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--color-muted-fg)]">{u.phone || '-'}</TableCell>
                    <TableCell className="text-sm text-[var(--color-muted-fg)]">
                      <div className="truncate max-w-[150px]" title={u.address}>{u.address || '-'}</div>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--color-muted-fg)]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleRemove(u)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-transparent ${u.isRemoved ? 'text-green-500 hover:bg-green-500/10 hover:border-green-500/20' : 'text-yellow-600 hover:bg-yellow-500/10 hover:border-yellow-500/20'}`}>
                          {u.isRemoved ? 'Restore' : 'Block'}
                        </button>
                        {u.isRemoved && (
                          <button onClick={() => handleHardDelete(u.uid)} className="text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-red-500/20">
                            Delete
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4 p-4 min-h-[400px]">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-[var(--color-muted-fg)]">
              No users found.
            </div>
          ) : (
            filtered.map(u => (
              <div key={u.uid} className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col shadow-sm relative overflow-hidden ${u.isRemoved ? 'opacity-75' : ''}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 40, height: 40, borderRadius: '12px',
                      background: avatarColor(u.name), display: 'grid', placeItems: 'center',
                      color: '#fff', fontSize: '14px', fontWeight: 800, flexShrink: 0
                    }}>
                      {initials(u.name)}
                    </div>
                    <div>
                      <h3 className={`font-bold text-[var(--color-fg)] text-sm ${u.isRemoved ? 'line-through' : ''}`}>{u.name || 'Unknown'}</h3>
                      <p className="text-xs text-[var(--color-muted-fg)] truncate max-w-[150px]">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize shrink-0 ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                    {u.role || 'user'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 mb-4 mt-2">
                  <div className="flex items-center gap-2 text-xs text-[var(--color-muted-fg)]">
                    <Phone className="w-3 h-3" /> {u.phone || 'No phone'}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[var(--color-muted-fg)] mt-1">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> <span className="truncate max-w-[200px]">{u.address || 'No address'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-auto pt-4 border-t border-[var(--color-border)]">
                  <button onClick={() => handleRemove(u)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${u.isRemoved ? 'text-green-500 border-green-500/20 bg-green-500/5 hover:bg-green-500/10' : 'text-yellow-600 border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10'}`}>
                    {u.isRemoved ? 'Restore' : 'Block User'}
                  </button>
                  {u.isRemoved && (
                    <button onClick={() => handleHardDelete(u.uid)} className="text-red-500 hover:bg-red-500/10 px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-red-500/20 bg-red-500/5">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  )
}
