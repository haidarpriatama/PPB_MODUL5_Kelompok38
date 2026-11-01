import { useState } from 'react'
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react'
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  generateWhatsAppCheckoutUrl,
} from '../../utils/cartStorage'
import { formatPrice } from '../../utils/helpers'

/**
 * CartModal — Shopping cart modal with items management & WhatsApp checkout redirect
 */
export default function CartModal({ open, onClose }) {
  const [cart, setCart] = useState(() => getCart())
  const [note, setNote] = useState('')

  if (!open) return null

  const handleUpdateQty = (id, delta) => {
    const updated = updateCartQuantity(id, delta)
    setCart(updated)
  }

  const handleRemove = (id) => {
    const updated = removeFromCart(id)
    setCart(updated)
  }

  const handleClear = () => {
    clearCart()
    setCart([])
  }

  const totalAmount = getCartTotal(cart)

  const handleCheckoutWA = () => {
    if (cart.length === 0) return
    const waUrl = generateWhatsAppCheckoutUrl(cart, note)
    window.open(waUrl, '_blank')
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-box modal-box--md cart-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} stroke="var(--brass)" />
            <h3 className="modal-title display" style={{ margin: 0 }}>Shopping Cart</h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close cart modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div className="cart-empty-state" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <ShoppingBag size={48} stroke="var(--line)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem' }}>
                Your cart is empty.
              </p>
              <p style={{ color: 'var(--steel)', fontSize: '0.9rem', margin: 0 }}>
                Explore the armory catalog and add hardware to proceed.
              </p>
            </div>
          ) : (
            <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => {
                const identifier = item.id || item.name
                return (
                  <div
                    key={identifier}
                    className="cart-item-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: '54px',
                        height: '54px',
                        objectFit: 'contain',
                        background: '#fff',
                        borderRadius: '4px',
                        padding: '4px',
                        border: '1px solid var(--line)',
                      }}
                      loading="lazy"
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="display"
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ color: 'var(--steel)', fontSize: '0.82rem' }}>
                        {item.type} {item.caliber ? `· ${item.caliber}` : ''}
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--brass)', fontSize: '0.9rem', marginTop: '2px' }}>
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: '28px', height: '28px', border: '1px solid var(--line)' }}
                        onClick={() => handleUpdateQty(identifier, -1)}
                        title="Kurangi"
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="icon-btn"
                        style={{ width: '28px', height: '28px', border: '1px solid var(--line)' }}
                        onClick={() => handleUpdateQty(identifier, 1)}
                        title="Tambah"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ minWidth: '70px', textAlign: 'right', fontWeight: 700, fontSize: '0.95rem' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: '#c53030' }}
                      onClick={() => handleRemove(identifier)}
                      title="Hapus dari keranjang"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}

              {/* Note / Customer message */}
              <div style={{ marginTop: '10px' }}>
                <label
                  htmlFor="cart-note"
                  style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--steel)', marginBottom: '4px' }}
                >
                  Catatan Pemesanan / Alamat Pengiriman (Opsional):
                </label>
                <textarea
                  id="cart-note"
                  rows={2}
                  className="form-textarea"
                  style={{ fontSize: '0.88rem' }}
                  placeholder="Contoh: Kirim ke Jakarta, packing kayu..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--steel)' }}>Total Tagihan:</div>
              <div className="display" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)' }}>
                {formatPrice(totalAmount)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleClear}
                title="Kosongkan keranjang"
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="btn btn--primary"
                style={{
                  background: '#25D366',
                  borderColor: '#25D366',
                  color: '#fff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={handleCheckoutWA}
                title="Checkout dan kirim pesanan via WhatsApp"
              >
                <MessageCircle size={17} /> Checkout WhatsApp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
