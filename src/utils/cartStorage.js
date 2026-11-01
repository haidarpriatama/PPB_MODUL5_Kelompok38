// ---------------------------------------------------------------------------
// cartStorage.js — Shopping cart management with WhatsApp checkout link
// ---------------------------------------------------------------------------

const CART_KEY = 'bore_barrel_cart'
const WA_PHONE_NUMBER = '6281380064556'

export const getCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
    window.dispatchEvent(new Event('cart_updated'))
  } catch (err) {
    console.error('Failed to save cart:', err)
  }
}

export const addToCart = (gun, qty = 1) => {
  if (!gun) return []
  const cart = getCart()
  const identifier = gun.id || gun.name
  const index = cart.findIndex((item) => (item.id || item.name) === identifier)

  if (index > -1) {
    cart[index].quantity += qty
  } else {
    cart.push({
      id: gun.id,
      name: gun.name || 'Hardware Piece',
      price: Number(gun.price || 0),
      type: gun.type || gun.category || 'Hardware',
      caliber: gun.caliber || '',
      image: gun.image_url || gun.image || '/guns/pistol.svg',
      quantity: qty > 0 ? qty : 1,
    })
  }

  saveCart(cart)
  return cart
}

export const updateCartQuantity = (identifier, delta) => {
  let cart = getCart()
  cart = cart
    .map((item) => {
      if ((item.id || item.name) === identifier) {
        const newQty = item.quantity + delta
        return { ...item, quantity: newQty }
      }
      return item
    })
    .filter((item) => item.quantity > 0)

  saveCart(cart)
  return cart
}

export const removeFromCart = (identifier) => {
  const cart = getCart().filter((item) => (item.id || item.name) !== identifier)
  saveCart(cart)
  return cart
}

export const clearCart = () => {
  saveCart([])
}

export const getCartTotal = (cart = getCart()) => {
  return cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0)
}

export const getCartItemCount = (cart = getCart()) => {
  return cart.reduce((count, item) => count + (item.quantity || 1), 0)
}

/**
 * Generate WhatsApp checkout URL with prefilled order details
 */
export const generateWhatsAppCheckoutUrl = (cart = getCart(), customerNote = '') => {
  const total = getCartTotal(cart)
  const itemsText = cart
    .map((item, idx) => `${idx + 1}. ${item.name} (${item.caliber ? item.caliber + ' · ' : ''}${item.quantity}x @ $${item.price.toLocaleString()}) = $${(item.price * item.quantity).toLocaleString()}`)
    .join('\n')

  let message = `Hi aku mau pesan perlengkapan senjata di Bore & Barrel (Kelompok 38):\n\n${itemsText}\n\n*Total Tagihan: $${total.toLocaleString()}*`

  if (customerNote && customerNote.trim()) {
    message += `\n\nCatatan Khusus: ${customerNote.trim()}`
  }

  message += `\n\nMohon informasi ketersediaan dan prosedur pembayarannya. Terima kasih!`

  return `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(message)}`
}

export default {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartTotal,
  getCartItemCount,
  generateWhatsAppCheckoutUrl,
}
