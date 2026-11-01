import { useState, useEffect } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { getCartItemCount } from '../utils/cartStorage'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', hasBadge: true },
  { id: 'Profile', label: 'Profile' },
]

function Header({ tab, onTab, onNavigateCreate, onOpenCart }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0

  const [cartCount, setCartCount] = useState(() => getCartItemCount())

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartCount(getCartItemCount())
    }
    window.addEventListener('cart_updated', handleCartUpdate)
    return () => window.removeEventListener('cart_updated', handleCartUpdate)
  }, [])

  return (
    <header className="header">
      <div
        className="header-brand-wrap"
        onClick={() => onTab('Catalog')}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            {item.hasBadge && favCount > 0 && (
              <span className="nav-badge">{favCount}</span>
            )}
          </button>
        ))}

        {/* Shopping Cart button */}
        <button
          type="button"
          className="nav-link cart-nav-btn"
          onClick={onOpenCart}
          title="Lihat Keranjang Belanja"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
        >
          <ShoppingCart size={17} />
          <span>Cart</span>
          {cartCount > 0 && (
            <span
              className="nav-badge"
              style={{
                background: 'var(--brass)',
                color: '#fff',
                marginLeft: '2px',
                fontSize: '0.75rem',
                padding: '2px 6px',
                borderRadius: '10px',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </nav>

      {onNavigateCreate && (
        <button
          type="button"
          className="btn btn--primary btn--sm header-cta"
          onClick={onNavigateCreate}
          title="Register new hardware"
        >
          <Plus size={15} /> Add Hardware
        </button>
      )}
    </header>
  )
}

export default Header
