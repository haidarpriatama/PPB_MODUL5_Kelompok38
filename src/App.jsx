import { useState, useEffect, lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import gunService from './services/gunService.js'
import { Loader } from 'lucide-react'
import './App.css'

// Lazy loaded page components (Challenge 3: Lazy Loading)
const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.jsx'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage = lazy(() => import('./pages/EditGunPage.jsx'))
const GunDetail = lazy(() => import('./components/gun/GunDetail.jsx'))
const CartModal = lazy(() => import('./components/modals/CartModal.jsx'))

// Loading Fallback Component
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '12px',
        color: 'var(--steel)',
      }}
    >
      <Loader size={32} className="spin" stroke="var(--brass)" />
      <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Loading Bore &amp; Barrel module…</span>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail' | 'edit-profile'
  const [selectedGun, setSelectedGun] = useState(null)
  const [editingGun, setEditingGun] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  // Challenge 2: Direct link via unique URL (?gun=<id>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const gunId = params.get('gun')
    if (gunId) {
      gunService
        .getGunById(gunId)
        .then((res) => {
          if (res && res.success && res.data) {
            setSelectedGun(res.data)
            setMode('detail')
          }
        })
        .catch((err) => {
          console.warn('Failed to load shared gun item:', err)
        })
    }
  }, [])

  // Unified navigation handler
  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Detail') {
      setSelectedGun(payload)
      setMode('detail')
      // Update URL query param for shareability
      if (payload?.id) {
        const url = new URL(window.location.href)
        url.searchParams.set('gun', payload.id)
        window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''))
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'EditProfile') {
      setMode('edit-profile')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Tab change (Catalog, Favorites, Profile)
      setTab(target)
      setMode('list')
      setSelectedGun(null)
      setEditingGun(null)

      // Clean query parameter when changing tab
      const url = new URL(window.location.href)
      url.searchParams.delete('gun')
      window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''))

      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedGun(null)
    setEditingGun(null)

    // Clear query param
    const url = new URL(window.location.href)
    url.searchParams.delete('gun')
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
  }

  const handleResumeDraft = (draft) => {
    if (draft.id === 'create') {
      handleNavigate('Create')
    } else {
      handleNavigate('Edit', { id: draft.id, ...draft.data.formData })
    }
  }

  return (
    <div className="shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="main">
        <Suspense fallback={<PageLoader />}>
          {/* Sub-page views */}
          {mode === 'create' && (
            <CreateGunPage
              onBack={handleBackToList}
              onSuccess={() => {
                handleBackToList()
                setTab('Catalog')
              }}
            />
          )}

          {mode === 'edit' && (
            <EditGunPage
              gun={editingGun}
              gunId={editingGun?.id}
              onBack={handleBackToList}
              onSuccess={() => {
                handleBackToList()
                setTab('Catalog')
              }}
            />
          )}

          {mode === 'edit-profile' && (
            <EditProfilePage
              onBack={() => {
                setMode('list')
                setTab('Profile')
              }}
              onSaved={() => {
                setMode('list')
                setTab('Profile')
              }}
            />
          )}

          {mode === 'detail' && selectedGun && (
            <GunDetail
              gun={selectedGun}
              onBack={handleBackToList}
              onEdit={(g) => handleNavigate('Edit', g)}
              onDelete={(g) => setDeleteTarget(g)}
            />
          )}

          {/* Top-level Tabs */}
          {mode === 'list' && (
            <>
              {tab === 'Catalog' && (
                <Catalog
                  onNavigate={(destination, payload) => handleNavigate(destination, payload)}
                />
              )}
              {tab === 'Favorites' && (
                <FavoritesPage
                  onSelectGun={(g) => handleNavigate('Detail', g)}
                  onNavigateCatalog={() => setTab('Catalog')}
                />
              )}
              {tab === 'Profile' && (
                <ProfilePage
                  onReplaySplash={() => setShowSplash(true)}
                  onNavigateEditProfile={() => handleNavigate('EditProfile')}
                  onResumeDraft={handleResumeDraft}
                />
              )}
            </>
          )}
        </Suspense>
      </main>

      {/* Global Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Hardware Record"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            setDeleting(true)
            await gunService.deleteGun(deleteTarget.id)
            setDeleteTarget(null)
            handleBackToList()
            setTab('Catalog')
          } catch (err) {
            alert(err.message || 'Failed to delete record.')
          } finally {
            setDeleting(false)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Shopping Cart Modal (Challenge 8) */}
      <Suspense fallback={null}>
        <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
      </Suspense>

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
