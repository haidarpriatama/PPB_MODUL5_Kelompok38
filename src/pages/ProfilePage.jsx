import { useState, useEffect } from 'react'
import {
  Shield,
  Copy,
  Check,
  Heart,
  FileText,
  Play,
  Edit2,
  Trash2,
  ArrowRight,
  Info,
  Phone,
  Clock,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { getAllDrafts, deleteDraft } from '../utils/draftStorage'
import { formatPrice } from '../utils/helpers'

/**
 * ProfilePage — User identity, Saved Drafts list, About section, and Contact section.
 * Edit profile is accessed via a dedicated page.
 */
export default function ProfilePage({
  onReplaySplash,
  onNavigateEditProfile,
  onResumeDraft,
}) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [copied, setCopied] = useState(false)
  const [draftsList, setDraftsList] = useState(() => getAllDrafts())
  const [activeSection, setActiveSection] = useState('all') // 'all' | 'drafts' | 'about' | 'contact'

  const { favorites } = useFavorites()

  useEffect(() => {
    setProfile(userService.getUserProfile())
    setDraftsList(getAllDrafts())
  }, [])

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDeleteDraft = (draftId) => {
    if (window.confirm('Hapus draft ini? Data tidak tersimpan akan hilang.')) {
      deleteDraft(draftId)
      setDraftsList(getAllDrafts())
    }
  }

  const teamMembers = [
    { nama: 'Haidar Rafi Apta Priatama', nim: '21120124140107' },
    { nama: 'Shofwan Thufail Akhmad', nim: '21120124130066' },
    { nama: 'Josh Peter Sirait', nim: '21120124140155' },
    { nama: 'Chico Diar Ramadhan', nim: '21120124140150' },
  ]

  return (
    <div className="profile-page page">
      {/* Masthead */}
      <section
        className="masthead"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1 className="display" style={{ margin: '0 0 4px' }}>Operator Station &amp; Profile</h1>
          <p className="lede" style={{ margin: 0 }}>
            Kredensial operator, draf katalog tersimpan, profil kelompok, dan informasi toko.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onNavigateEditProfile && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onNavigateEditProfile}
              title="Buka halaman edit profil"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Edit2 size={14} /> Edit Profile
            </button>
          )}

          {onReplaySplash && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onReplaySplash}
              title="Putar ulang animasi pembuka"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Play size={14} /> Replay Intro
            </button>
          )}
        </div>
      </section>

      {/* Operator Card */}
      <div className="profile-card" style={{ marginBottom: '2rem' }}>
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
          </div>

          <div className="profile-identity">
            <h2 className="display" style={{ margin: '0 0 4px' }}>{profile.username || 'Kelompok 38'}</h2>
            <div className="profile-id-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono-badge">{profile.userId}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={handleCopyId}
                title="Salin ID Operator"
              >
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
            {profile.bio && (
              <p style={{ margin: '8px 0 0', color: 'var(--steel)', fontSize: '0.9rem' }}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Procurement Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{draftsList.length}</div>
            <div className="stat-label">Saved Offline Drafts</div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div
        className="profile-nav-tabs"
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          className={`btn btn--sm ${activeSection === 'all' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setActiveSection('all')}
        >
          Semua Section
        </button>
        <button
          type="button"
          className={`btn btn--sm ${activeSection === 'drafts' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setActiveSection('drafts')}
        >
          Draft Katalog ({draftsList.length})
        </button>
        <button
          type="button"
          className={`btn btn--sm ${activeSection === 'about' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setActiveSection('about')}
        >
          About (Kelompok 38)
        </button>
        <button
          type="button"
          className={`btn btn--sm ${activeSection === 'contact' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setActiveSection('contact')}
        >
          Contact Toko
        </button>
      </div>

      {/* SECTION 1: DRAFTS LIST (Challenge 5) */}
      {(activeSection === 'all' || activeSection === 'drafts') && (
        <section
          className="profile-section-card"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} stroke="var(--brass)" />
              <h2 className="display" style={{ margin: 0, fontSize: '1.3rem' }}>
                Katalog Tersimpan di Draft ({draftsList.length})
              </h2>
            </div>
            <p style={{ margin: 0, color: 'var(--steel)', fontSize: '0.85rem' }}>
              Draf disimpan di penyimpanan lokal perangkat (offline-first).
            </p>
          </div>

          {draftsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--steel)' }}>
              <FileText size={36} stroke="var(--line)" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Belum ada draft katalog yang tersimpan.</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem' }}>
                Saat Anda mengisi formulir registrasi atau edit hardware, draf otomatis disimpan di sini.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {draftsList.map((draft) => {
                const formData = draft.data.formData || {}
                const title = formData.name || (draft.id === 'create' ? 'Draft Senjata Baru' : `Draft Senjata #${draft.id}`)
                const type = formData.type || 'Pistol'
                const price = formData.price ? formatPrice(formData.price) : '$0'

                return (
                  <div
                    key={draft.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: '6px',
                      flexWrap: 'wrap',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div className="display" style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--ink)' }}>
                        {title}
                      </div>
                      <div style={{ color: 'var(--steel)', fontSize: '0.85rem', marginTop: '2px' }}>
                        {type} {formData.caliber ? `· ${formData.caliber}` : ''} · {price} · Disimpan: {draft.formattedTime}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {onResumeDraft && (
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => onResumeDraft(draft)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Lanjutkan <ArrowRight size={13} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDeleteDraft(draft.id)}
                        title="Hapus draft"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: ABOUT SECTION (Challenge 5) */}
      {(activeSection === 'all' || activeSection === 'about') && (
        <section
          className="profile-section-card"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Info size={20} stroke="var(--brass)" />
            <h2 className="display" style={{ margin: 0, fontSize: '1.3rem' }}>
              About Bore &amp; Barrel
            </h2>
          </div>

          <p className="lede" style={{ margin: '0 0 1.25rem', fontSize: '0.95rem' }}>
            Bore &amp; Barrel sells a short, honest list of firearms. Each piece is priced
            from the bench — no markup theatre, no filler. Fully built as an offline-first
            Progressive Web App (PWA) with React, Vite, and Supabase RESTful API.
          </p>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
            <h3 className="display" style={{ fontSize: '1.15rem', margin: '0 0 4px' }}>
              Praktikum Pemrograman Perangkat Bergerak
            </h3>
            <p style={{ color: 'var(--brass)', fontWeight: 600, margin: '0 0 1rem', fontSize: '0.9rem' }}>
              Modul 5 — Progressive Web App (PWA) II &bull; Kelompok 38
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {teamMembers.map((m) => (
                <div
                  key={m.nim}
                  style={{
                    padding: '10px 14px',
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--ink)' }}>{m.nama}</div>
                  <div style={{ color: 'var(--steel)', fontSize: '0.82rem', marginTop: '2px' }}>NIM: {m.nim}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: CONTACT SECTION (Challenge 5) */}
      {(activeSection === 'all' || activeSection === 'contact') && (
        <section
          className="profile-section-card"
          style={{
            background: 'var(--paper)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Phone size={20} stroke="var(--brass)" />
            <h2 className="display" style={{ margin: 0, fontSize: '1.3rem' }}>
              Contact &amp; Armory Location
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <MapPin size={20} stroke="var(--brass)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Location:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--steel)', fontSize: '0.9rem' }}>
                  123 Range Road, Sector 7
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Clock size={20} stroke="var(--brass)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Operating Hours:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--steel)', fontSize: '0.9rem' }}>
                  Tuesday to Saturday, 10:00 – 18:00
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Phone size={20} stroke="var(--brass)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Customer Support:</strong>
                <p style={{ margin: '2px 0 0', color: 'var(--steel)', fontSize: '0.9rem' }}>
                  (555) 010-0100 / WA: +62 813-8006-4556
                </p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/6281380064556?text=Hi%20Bore%20%26%20Barrel%20Kelompok%2038,%20saya%20ingin%20bertanya%20mengenai%20produk%20senjata."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary btn--sm"
              style={{
                background: '#25D366',
                borderColor: '#25D366',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <MessageCircle size={15} /> Hubungi via WhatsApp (+62 813-8006-4556)
            </a>
          </div>
        </section>
      )}
    </div>
  )
}
