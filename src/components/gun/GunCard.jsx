import { useState } from 'react'
import { Share2, ShoppingCart, Archive, RotateCcw, Trash2, Check, Images } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { formatPrice, truncate } from '../../utils/helpers'
import { addToCart } from '../../utils/cartStorage'

/**
 * Product card used in the catalog grid with Share, Cart, and Archive support.
 */
export default function GunCard({
  gun,
  onSelect,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  isArchived = false,
}) {
  const [copied, setCopied] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const imgSrc = gun.image_url || gun.image || '/guns/pistol.svg'
  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0
  const imageCount = Array.isArray(gun.images) ? gun.images.length : 1

  const handleShare = async (e) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}${window.location.pathname}?gun=${gun.id || ''}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${gun.name} - Bore & Barrel`,
          text: `Check out ${gun.name} (${caliber || category}) at Bore & Barrel!`,
          url: shareUrl,
        })
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fall through to clipboard
        } else {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert(`Tautan unik:\n${shareUrl}`)
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(gun, 1)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <li className={`card ${isArchived ? 'card--archived' : ''}`}>
      <button
        type="button"
        className="card-btn"
        onClick={() => onSelect(gun)}
        aria-label={`View ${gun.name}`}
      >
        <div style={{ position: 'relative', width: '100%', height: '180px' }}>
          <img
            className="card-img"
            src={imgSrc}
            alt={gun.name}
            width="240"
            height="180"
            loading="lazy"
            decoding="async"
          />
          {imageCount > 1 && (
            <span
              className="card-img-badge"
              title={`${imageCount} images available`}
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(24, 34, 44, 0.85)',
                color: '#fff',
                fontSize: '0.75rem',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Images size={12} /> {imageCount}
            </span>
          )}
          {isArchived && (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                background: '#c53030',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Archived
            </span>
          )}
        </div>

        <span className="name display">{gun.name}</span>

        <span className="type">
          {category}
          {caliber ? ` · ${caliber}` : ''}
        </span>

        {gun.description && (
          <span className="card-desc">{truncate(gun.description, 72)}</span>
        )}

        <span className="price">{formatPrice(price)}</span>
      </button>

      {/* Floating actions row */}
      <div className="card-actions" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {/* Share Button (Challenge 2) */}
        <button
          type="button"
          className="card-act-btn"
          onClick={handleShare}
          title={copied ? 'Tautan Disalin!' : 'Bagikan Tautan Senjata'}
          aria-label="Share gun link"
          style={{ color: copied ? '#25D366' : 'inherit' }}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
        </button>

        {!isArchived && (
          <>
            {/* Add to Cart (Challenge 8) */}
            <button
              type="button"
              className="card-act-btn"
              onClick={handleAddToCart}
              title={addedToCart ? 'Ditambahkan ke keranjang!' : 'Tambah ke Keranjang'}
              aria-label="Add to cart"
              style={{ color: addedToCart ? 'var(--brass)' : 'inherit' }}
            >
              {addedToCart ? <Check size={14} /> : <ShoppingCart size={14} />}
            </button>

            <FavoriteButton gunId={gun.id || gun.name} />

            {onEdit && (
              <button
                type="button"
                className="card-act-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(gun)
                }}
                aria-label={`Edit ${gun.name}`}
                title="Edit"
              >
                ✏️
              </button>
            )}

            {onArchive && (
              <button
                type="button"
                className="card-act-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(gun)
                }}
                aria-label={`Archive ${gun.name}`}
                title="Arsipkan (Soft Delete)"
              >
                <Archive size={14} />
              </button>
            )}
          </>
        )}

        {/* If archived, show restore and permanent delete buttons */}
        {isArchived && (
          <>
            {onRestore && (
              <button
                type="button"
                className="card-act-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onRestore(gun)
                }}
                aria-label={`Restore ${gun.name}`}
                title="Pulihkan dari Arsip"
                style={{ color: '#2b6cb0' }}
              >
                <RotateCcw size={14} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="card-act-btn card-act-btn--danger"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(gun)
                }}
                aria-label={`Delete Permanently ${gun.name}`}
                title="Hapus Permanen"
              >
                <Trash2 size={14} />
              </button>
            )}
          </>
        )}
      </div>
    </li>
  )
}
