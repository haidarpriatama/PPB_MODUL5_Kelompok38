import { useState } from 'react'
import {
  ArrowLeft,
  Star,
  Send,
  Loader,
  Share2,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  Edit2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  X,
  CheckCircle,
} from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { useReviews, useCreateReview } from '../../hooks/useReviews'
import reviewService from '../../services/reviewService'
import { getUserIdentifier } from '../../services/userService'
import { formatPrice, averageRating } from '../../utils/helpers'
import { addToCart } from '../../utils/cartStorage'
import { getReviewVote, voteReview } from '../../utils/reviewVotes'

/**
 * Full-screen product detail view with Image Gallery, Share, Add to Cart,
 * and Full Review CRUD with Thumbs Up / Thumbs Down reactions.
 */
export default function GunDetail({ gun, onBack, onEdit, onDelete }) {
  // Gallery multiple images (Challenge 9)
  const images = Array.isArray(gun.images) && gun.images.length > 0
    ? gun.images
    : [gun.image_url || gun.image || '/guns/pistol.svg']
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const currentImgSrc = images[selectedImageIndex] || images[0]

  const category = gun.type || gun.category || '—'
  const caliber = gun.caliber || gun.difficulty || ''
  const price = gun.price ?? gun.cook_time ?? 0

  // Cart quantity state (Challenge 8)
  const [orderQty, setOrderQty] = useState(1)
  const [cartFeedback, setCartFeedback] = useState('')

  // Share state (Challenge 2)
  const [shareFeedback, setShareFeedback] = useState('')

  // Reviews & Current user identifier
  const currentUserId = getUserIdentifier()
  const { reviews, loading: reviewsLoading, refetch: refetchReviews } = useReviews(gun.id)
  const { createReview, loading: submitting } = useCreateReview()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  // Edit Review state (Challenge 7)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Review reactions state map for real-time UI updates
  const [, setVoteTrigger] = useState(0)

  const avgRating = gun.average_rating || averageRating(reviews)
  const reviewCount = gun.review_count ?? reviews.length

  // Add to cart handler
  const handleAddToCart = () => {
    addToCart(gun, orderQty)
    setCartFeedback(`Berhasil menambahkan ${orderQty} ${gun.name} ke keranjang!`)
    setTimeout(() => setCartFeedback(''), 2500)
  }

  // Share handler (Challenge 2)
  const handleShare = async () => {
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
          // fallback
        } else {
          return
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareFeedback('Tautan unik senjata berhasil disalin!')
      setTimeout(() => setShareFeedback(''), 2500)
    } catch {
      alert(`Tautan unik:\n${shareUrl}`)
    }
  }

  // Submit new review
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')

    if (rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    const result = await createReview(gun.id, {
      user_id: currentUserId,
      user_identifier: currentUserId,
      rating,
      comment: comment.trim(),
    })

    if (result) {
      setReviewSuccess('Review berhasil dikirim!')
      setComment('')
      setRating(5)
      refetchReviews(true)
      setTimeout(() => setReviewSuccess(''), 3000)
    } else {
      setReviewError('Gagal mengirim review. Periksa koneksi server.')
    }
  }

  // Start editing a review
  const handleStartEditReview = (rev) => {
    setEditingReviewId(rev.id)
    setEditRating(rev.rating)
    setEditComment(rev.comment || '')
  }

  // Save edited review
  const handleSaveEditReview = async (reviewId) => {
    try {
      setSavingEdit(true)
      await reviewService.updateReview(
        reviewId,
        { rating: editRating, comment: editComment.trim() },
        gun.id,
      )
      setEditingReviewId(null)
      refetchReviews(true)
    } catch (err) {
      alert(err.message || 'Gagal memperbarui review.')
    } finally {
      setSavingEdit(false)
    }
  }

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus review ini?')) return
    try {
      await reviewService.deleteReview(reviewId, gun.id)
      refetchReviews(true)
    } catch (err) {
      alert(err.message || 'Gagal menghapus review.')
    }
  }

  // Vote thumbs up / down
  const handleVote = (reviewId, type) => {
    voteReview(reviewId, type)
    setVoteTrigger((prev) => prev + 1)
  }

  return (
    <div className="detail">
      {/* Toast Feedback */}
      {cartFeedback && (
        <div className="toast toast--success" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          <CheckCircle size={18} /> {cartFeedback}
        </div>
      )}
      {shareFeedback && (
        <div className="toast toast--success" style={{ position: 'fixed', top: '65px', right: '20px', zIndex: 9999 }}>
          <Check size={18} /> {shareFeedback}
        </div>
      )}

      {/* Back button */}
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Catalog
      </button>

      {/* Hero with Multiple Image Gallery (Challenge 9) */}
      <div className="detail-hero" style={{ alignItems: 'flex-start' }}>
        <div className="detail-gallery-container" style={{ flex: '1 1 360px', maxWidth: '480px' }}>
          {/* Main Large Image */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '280px',
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              className="detail-img"
              src={currentImgSrc}
              alt={gun.name}
              style={{ maxHeight: '280px', objectFit: 'contain', width: '100%' }}
              loading="lazy"
              decoding="async"
            />
            {images.length > 1 && (
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(24, 34, 44, 0.8)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {selectedImageIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Thumbnail Gallery Strip (Challenge 9) */}
          {images.length > 1 && (
            <div
              className="detail-thumbnails"
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                overflowX: 'auto',
                paddingBottom: '4px',
              }}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  style={{
                    border: idx === selectedImageIndex ? '2px solid var(--brass)' : '1px solid var(--line)',
                    background: '#fff',
                    borderRadius: '6px',
                    padding: '4px',
                    width: '64px',
                    height: '64px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    opacity: idx === selectedImageIndex ? 1 : 0.65,
                    transition: 'all 0.15s ease',
                  }}
                  title={`Foto ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="detail-info" style={{ flex: '1 1 340px' }}>
          <h1 className="display" style={{ margin: '0 0 6px' }}>{gun.name}</h1>
          <p className="type" style={{ margin: '0 0 10px', color: 'var(--steel)' }}>
            {category}
            {caliber ? ` · ${caliber}` : ''}
          </p>
          <p className="price detail-price" style={{ margin: '0 0 14px' }}>{formatPrice(price)}</p>

          {avgRating > 0 && (
            <p className="detail-rating" style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={18} fill="var(--brass)" stroke="var(--brass)" />
              <strong>{avgRating.toFixed(1)}</strong> ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
            </p>
          )}

          {/* Add to Cart Section (Challenge 8) */}
          <div
            className="detail-cart-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '1.25rem 0',
              padding: '12px',
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '32px', height: '32px', border: '1px solid var(--line)' }}
                onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                title="Kurang"
              >
                <Minus size={14} />
              </button>
              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                {orderQty}
              </span>
              <button
                type="button"
                className="icon-btn"
                style={{ width: '32px', height: '32px', border: '1px solid var(--line)' }}
                onClick={() => setOrderQty((q) => q + 1)}
                title="Tambah"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAddToCart}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
            >
              <ShoppingCart size={16} /> Tambah ke Keranjang
            </button>
          </div>

          {/* Secondary Action Buttons (Share, Favorite, Edit, Delete) */}
          <div className="detail-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <FavoriteButton gunId={gun.id || gun.name} />

            {/* Share Link Button (Challenge 2) */}
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleShare}
              title="Bagikan tautan unik senjata ini"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Share2 size={15} /> Share Link
            </button>

            {onEdit && (
              <button type="button" className="btn btn--outline" onClick={() => onEdit(gun)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button type="button" className="btn btn--danger" onClick={() => onDelete(gun)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="detail-section">
        <h2>Description</h2>
        <p>{gun.description || 'No description available.'}</p>
      </section>

      {/* Specifications */}
      {gun.ingredients && gun.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Specifications</h2>
          <ul className="detail-specs">
            {gun.ingredients.map((ing, i) => (
              <li key={ing.id || i}>
                <strong>{ing.name}</strong> — {ing.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Steps */}
      {gun.steps && gun.steps.length > 0 && (
        <section className="detail-section">
          <h2>Assembly / Maintenance Steps</h2>
          <ol className="detail-steps">
            {gun.steps.map((step, i) => (
              <li key={step.id || i}>
                {step.instruction || step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Reviews Section with Full CRUD & Thumbs Up/Down (Challenge 7) */}
      <section className="detail-section">
        <h2>Reviews & Community Ratings</h2>

        {/* Submit review */}
        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star-btn"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
              >
                <Star
                  size={22}
                  fill={n <= rating ? 'var(--brass)' : 'none'}
                  stroke={n <= rating ? 'var(--brass)' : 'var(--steel)'}
                />
              </button>
            ))}
          </div>

          <textarea
            className="review-input"
            rows="3"
            placeholder="Tulis ulasan produk ini…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !gun.id}
          >
            {submitting ? (
              <><Loader size={16} className="spin" /> Submitting…</>
            ) : (
              <><Send size={16} /> Submit Review</>
            )}
          </button>

          {reviewError && <p className="form-error">{reviewError}</p>}
          {reviewSuccess && <p className="form-success">{reviewSuccess}</p>}
          {!gun.id && (
            <p className="form-hint">
              Reviews require a server-generated product ID. This product is local-only.
            </p>
          )}
        </form>

        {/* Existing reviews with CRUD & Thumbs Up/Down */}
        {reviewsLoading ? (
          <p className="detail-loading">Loading reviews…</p>
        ) : reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((rev) => {
              const isMyReview = rev.user_id === currentUserId
              const isEditing = editingReviewId === rev.id
              const vote = getReviewVote(rev.id)

              return (
                <li key={rev.id} className="review-item" style={{ padding: '14px', border: '1px solid var(--line)', borderRadius: '6px', marginBottom: '12px' }}>
                  {isEditing ? (
                    /* Inline Review Edit Form (Challenge 7) */
                    <div className="review-edit-box">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600 }}>Edit Ulasan Anda</span>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setEditingReviewId(null)}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="review-stars" style={{ marginBottom: '8px' }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            className="star-btn"
                            onClick={() => setEditRating(n)}
                          >
                            <Star
                              size={18}
                              fill={n <= editRating ? 'var(--brass)' : 'none'}
                              stroke={n <= editRating ? 'var(--brass)' : 'var(--steel)'}
                            />
                          </button>
                        ))}
                      </div>

                      <textarea
                        className="form-textarea"
                        rows={2}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        style={{ width: '100%', marginBottom: '8px' }}
                      />

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          disabled={savingEdit}
                          onClick={() => handleSaveEditReview(rev.id)}
                        >
                          {savingEdit ? 'Menyimpan…' : 'Simpan Perubahan'}
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setEditingReviewId(null)}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Normal Review View */
                    <>
                      <div className="review-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="review-user" style={{ fontWeight: 600 }}>
                            {rev.user_identifier || 'Operator Anonymous'}
                          </span>
                          {isMyReview && (
                            <span
                              style={{
                                background: 'var(--brass)',
                                color: '#fff',
                                fontSize: '0.68rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Anda
                            </span>
                          )}
                        </div>

                        <span className="review-stars-display">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? 'var(--brass)' : 'none'}
                              stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                            />
                          ))}
                        </span>
                      </div>

                      {rev.comment && <p className="review-comment" style={{ margin: '8px 0' }}>{rev.comment}</p>}

                      {/* Review Actions: Thumbs Up / Down & User CRUD */}
                      <div
                        className="review-actions-bar"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: '1px dashed var(--line)',
                        }}
                      >
                        {/* Thumbs Up / Down (Challenge 7) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button
                            type="button"
                            className="review-vote-btn"
                            style={{
                              background: vote.userVote === 'up' ? 'rgba(37, 211, 102, 0.15)' : 'transparent',
                              color: vote.userVote === 'up' ? '#25D366' : 'var(--steel)',
                              border: '1px solid var(--line)',
                              borderRadius: '4px',
                              padding: '3px 8px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onClick={() => handleVote(rev.id, 'up')}
                            title="Membantu (Thumbs Up)"
                          >
                            <ThumbsUp size={13} /> {vote.thumbsUp > 0 ? vote.thumbsUp : ''}
                          </button>

                          <button
                            type="button"
                            className="review-vote-btn"
                            style={{
                              background: vote.userVote === 'down' ? 'rgba(197, 48, 48, 0.15)' : 'transparent',
                              color: vote.userVote === 'down' ? '#c53030' : 'var(--steel)',
                              border: '1px solid var(--line)',
                              borderRadius: '4px',
                              padding: '3px 8px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onClick={() => handleVote(rev.id, 'down')}
                            title="Kurang Membantu (Thumbs Down)"
                          >
                            <ThumbsDown size={13} /> {vote.thumbsDown > 0 ? vote.thumbsDown : ''}
                          </button>
                        </div>

                        {/* Author CRUD actions (Challenge 7) */}
                        {isMyReview && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn--outline btn--sm"
                              style={{ padding: '2px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleStartEditReview(rev)}
                              title="Edit ulasan Anda"
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              style={{ padding: '2px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={() => handleDeleteReview(rev.id)}
                              title="Hapus ulasan Anda"
                            >
                              <Trash2 size={12} /> Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="detail-empty">No reviews yet. Be the first!</p>
        )}
      </section>
    </div>
  )
}
