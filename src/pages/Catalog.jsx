import { useState, useMemo, useEffect } from 'react'
import {
  RefreshCw,
  Plus,
  Loader,
  AlertCircle,
  PackageOpen,
  Archive,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  LayoutGrid,
  List,
} from 'lucide-react'
import { useGuns } from '../hooks/useGuns'
import GUNS_LOCAL from '../data/guns'
import GunCard from '../components/gun/GunCard'
import GunDetail from '../components/gun/GunDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import gunService from '../services/gunService'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'
import {
  archiveGun,
  restoreGun,
  getArchivedGuns,
} from '../utils/archiveStorage'

/**
 * Catalog page — product listing with Pagination, Query Caching, and Soft Delete / Archive.
 */
export default function Catalog({ onNavigate }) {
  // ---- API data with Query Caching ----
  const { guns: apiGuns, loading, error, refetch } = useGuns({ limit: 100 })
  const [useLocal, setUseLocal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // View state: 'active' or 'archived'
  const [viewArchived, setViewArchived] = useState(false)
  const [archivedGunsList, setArchivedGunsList] = useState(() => getArchivedGuns())

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Refresh archived list when switching view
  useEffect(() => {
    if (viewArchived) {
      setArchivedGunsList(getArchivedGuns())
    }
  }, [viewArchived])

  // Decide active data source
  const rawGuns = useMemo(() => {
    if (viewArchived) {
      return archivedGunsList
    }
    if (useLocal || (error && apiGuns.length === 0)) {
      return GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))
    }
    return apiGuns
  }, [apiGuns, archivedGunsList, error, useLocal, viewArchived])

  // ---- filters / sort ----
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    let result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder])

  // ---- Pagination state (Challenge 1) ----
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [layoutMode, setLayoutMode] = useState('grid') // 'grid' | 'list'

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeCategory, sortKey, sortOrder, viewArchived, itemsPerPage])

  const totalItems = filteredGuns.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  const paginatedGuns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredGuns.slice(start, start + itemsPerPage)
  }, [filteredGuns, currentPage, itemsPerPage])

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ---- detail view ----
  const [selectedGun, setSelectedGun] = useState(null)

  // ---- delete permanent confirmation ----
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Soft Delete / Archive Handler (Challenge 6)
  const handleArchiveGun = (gun) => {
    archiveGun(gun)
    showToast(`"${gun.name}" berhasil diarsipkan (soft delete).`)
    refetch(true) // Refresh active list
  }

  // Restore Handler (Challenge 6)
  const handleRestoreGun = (gun) => {
    restoreGun(gun.id)
    setArchivedGunsList(getArchivedGuns())
    showToast(`"${gun.name}" berhasil dipulihkan ke katalog utama.`)
    refetch(true)
  }

  // Permanent Delete Handler
  const handleDeletePermanent = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await gunService.deleteGun(deleteTarget.id)
      setDeleteTarget(null)
      setArchivedGunsList(getArchivedGuns())
      showToast(`"${deleteTarget.name}" berhasil dihapus permanen.`)
      refetch(true)
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus item.')
    } finally {
      setDeleting(false)
    }
  }

  // ---- If viewing a single product detail ----
  if (selectedGun) {
    return (
      <GunDetail
        gun={selectedGun}
        onBack={() => {
          setSelectedGun(null)
          // Clear query parameter from URL
          const url = new URL(window.location.href)
          url.searchParams.delete('gun')
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
        }}
        onEdit={(g) => {
          setSelectedGun(null)
          if (onNavigate) onNavigate('Edit', g)
        }}
        onDelete={(g) => {
          setSelectedGun(null)
          setDeleteTarget(g)
        }}
      />
    )
  }

  return (
    <div className="page catalog-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast--success" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          <CheckCircle size={18} /> {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <div className="catalog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="display" style={{ margin: '0 0 4px' }}>
            {viewArchived ? 'Hardware Archive (Arsip Senjata)' : 'The Armory Catalog'}
          </h1>
          <p className="lede" style={{ margin: 0 }}>
            {viewArchived
              ? 'Item katalog yang di-soft-delete. Anda dapat memulihkannya (restore) atau menghapusnya secara permanen.'
              : 'Pistols, rifles, and shotguns — verified stock and tactical specifications.'}
          </p>
        </div>

        <div className="catalog-top-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Toggle Archive / Soft Delete (Challenge 6) */}
          <button
            type="button"
            className={`btn ${viewArchived ? 'btn--primary' : 'btn--outline'} btn--sm`}
            onClick={() => setViewArchived(!viewArchived)}
            title={viewArchived ? 'Kembali ke Katalog Aktif' : 'Lihat Item Terarsip'}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Archive size={14} />
            <span>{viewArchived ? 'Katalog Aktif' : 'Arsip / Soft Delete'}</span>
            {!viewArchived && getArchivedGuns().length > 0 && (
              <span
                style={{
                  background: 'var(--brass)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '1px 5px',
                  borderRadius: '10px',
                }}
              >
                {getArchivedGuns().length}
              </span>
            )}
          </button>

          {/* Refresh with Query Cache bypass (Challenge 4) */}
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => {
              refetch(true)
              showToast('Data berhasil diperbarui dari server!')
            }}
            disabled={loading}
            title="Refresh katalog langsung dari server"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>

          {!viewArchived && onNavigate && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => onNavigate('Create')}
            >
              <Plus size={14} />
              Add Hardware
            </button>
          )}
        </div>
      </div>

      {/* Error Banner with fallback option */}
      {error && !useLocal && !viewArchived && (
        <div className="banner banner--warn" role="alert">
          <AlertCircle size={18} />
          <div className="banner-text">
            <strong>Server unreachable:</strong> {error}
          </div>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => setUseLocal(true)}
          >
            Use Offline Demo Data
          </button>
        </div>
      )}

      {/* Advanced Filter Component */}
      <AdvancedFilter
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        search={search}
        onSearchChange={setSearch}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSortChange={(k, o) => {
          setSortKey(k)
          setSortOrder(o)
        }}
      />

      {/* Product count, items per page selector, and layout view toggle */}
      <div
        className="catalog-meta"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '1.25rem 0 1rem',
          fontSize: '0.88rem',
          color: 'var(--steel)',
        }}
      >
        <span>
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}–
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} hardware pieces
          {viewArchived ? ' (Archived)' : ''}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Layout Mode Toggle: Grid vs List */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--paper)', border: '1px solid var(--line)', padding: '2px', borderRadius: '4px' }}>
            <button
              type="button"
              className={`icon-btn ${layoutMode === 'grid' ? 'active' : ''}`}
              onClick={() => setLayoutMode('grid')}
              title="Tampilan Grid (Kotak)"
              style={{
                width: '30px',
                height: '28px',
                background: layoutMode === 'grid' ? 'var(--brass)' : 'transparent',
                color: layoutMode === 'grid' ? '#fff' : 'var(--steel)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`icon-btn ${layoutMode === 'list' ? 'active' : ''}`}
              onClick={() => setLayoutMode('list')}
              title="Tampilan List (Baris)"
              style={{
                width: '30px',
                height: '28px',
                background: layoutMode === 'list' ? 'var(--brass)' : 'transparent',
                color: layoutMode === 'list' ? '#fff' : 'var(--steel)',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <List size={15} />
            </button>
          </div>

          {/* Items Per Page */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="items-per-page">Per Page:</label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--line)',
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontSize: '0.88rem',
              }}
            >
              <option value={6}>6 items</option>
              <option value={9}>9 items</option>
              <option value={12}>12 items</option>
              <option value={24}>24 items</option>
              <option value={100}>Semua (All)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && rawGuns.length === 0 ? (
        <div className="catalog-loading" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <Loader size={28} className="spin" style={{ margin: '0 auto 12px' }} />
          <p>Loading tactical armory hardware…</p>
        </div>
      ) : paginatedGuns.length > 0 ? (
        /* Product Grid (or List) with .stock CSS class */
        <ul className={layoutMode === 'list' ? 'stock stock--list' : 'stock'}>
          {paginatedGuns.map((gun) => (
            <GunCard
              key={gun.id || gun.name}
              gun={gun}
              onSelect={(g) => {
                setSelectedGun(g)
                // Set URL query param for shareable unique link
                if (g.id) {
                  const url = new URL(window.location.href)
                  url.searchParams.set('gun', g.id)
                  window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''))
                }
              }}
              onEdit={!viewArchived && onNavigate ? (g) => onNavigate('Edit', g) : null}
              onArchive={!viewArchived ? handleArchiveGun : null}
              onRestore={viewArchived ? handleRestoreGun : null}
              onDelete={viewArchived ? (g) => setDeleteTarget(g) : null}
              isArchived={viewArchived}
            />
          ))}
        </ul>
      ) : (
        /* Empty State */
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <PackageOpen size={48} stroke="var(--steel)" style={{ margin: '0 auto 12px' }} />
          <h2 className="display" style={{ margin: '0 0 8px' }}>
            {viewArchived ? 'No archived hardware' : 'No hardware found'}
          </h2>
          <p style={{ color: 'var(--steel)', margin: '0 0 16px' }}>
            {viewArchived
              ? 'Arsip senjata kosong. Item yang di-soft-delete akan muncul di sini.'
              : 'Try clearing your search query or choosing another category filter.'}
          </p>
          {(search || activeCategory !== 'All') && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                setSearch('')
                setActiveCategory('All')
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Pagination Bar (Challenge 1) */}
      {totalPages > 1 && (
        <div
          className="pagination-bar"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--line)',
          }}
        >
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`btn btn--sm ${pageNum === currentPage ? 'btn--primary' : 'btn--outline'}`}
                onClick={() => handlePageChange(pageNum)}
                style={{ minWidth: '36px', padding: '0.4rem 0.6rem' }}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Senjata Secara Permanen"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}" secara permanen? Data ini akan dihapus dari server dan tidak dapat dikembalikan lagi.`}
        confirmLabel="Hapus Permanen"
        danger
        loading={deleting}
        onConfirm={handleDeletePermanent}
        onCancel={() => {
          setDeleteTarget(null)
          setDeleteError('')
        }}
      />

      {deleteError && (
        <div className="toast toast--danger" style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
          <AlertCircle size={18} /> {deleteError}
        </div>
      )}
    </div>
  )
}
