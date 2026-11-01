import { useState } from 'react'
import {
  ArrowLeft,
  Camera,
  Shield,
  Save,
  CheckCircle,
} from 'lucide-react'
import userService from '../services/userService'

/**
 * EditProfilePage — Dedicated page for editing Operator profile & armorer details
 */
export default function EditProfilePage({ onBack, onSaved }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [username, setUsername] = useState(profile.username || 'Kelompok 38')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setFeedback('Foto profil maksimal berukuran 2MB.')
      setTimeout(() => setFeedback(''), 3000)
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatar(base64)
      setFeedback('Foto avatar berhasil dipilih.')
      setTimeout(() => setFeedback(''), 2500)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    setSaving(true)
    const updated = {
      ...profile,
      username: username.trim() || 'Kelompok 38',
      bio: bio.trim(),
      avatar,
    }
    const result = userService.saveUserProfile(updated)
    setSaving(false)

    if (result.success) {
      setProfile(result.data)
      setFeedback('Profil operator berhasil diperbarui!')
      setTimeout(() => {
        if (onSaved) onSaved(result.data)
        else if (onBack) onBack()
      }, 1000)
    } else {
      setFeedback('Gagal menyimpan profil.')
    }
  }

  return (
    <div className="page edit-profile-page" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <button
        type="button"
        className="btn btn--outline btn--sm"
        onClick={onBack}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Kembali ke Profil
      </button>

      <div className="form-title-group" style={{ marginBottom: '1.5rem' }}>
        <h1 className="display" style={{ margin: '0 0 6px' }}>Edit Operator Profile</h1>
        <p className="lede" style={{ margin: 0 }}>
          Perbarui data identitas operator, avatar, dan catatan stasiun persenjataan.
        </p>
      </div>

      {feedback && (
        <div className="toast toast--success" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle size={18} /> {feedback}
        </div>
      )}

      {/* Avatar preview & upload */}
      <div
        className="avatar-edit-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '1.25rem',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ position: 'relative', width: '84px', height: '84px' }}>
          {avatar ? (
            <img
              src={avatar}
              alt="Avatar preview"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--brass)',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'var(--panel)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--brass)',
              }}
            >
              <Shield size={38} stroke="var(--brass)" />
            </div>
          )}

          <label
            htmlFor="edit-avatar-input"
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: 'var(--brass)',
              color: '#fff',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid #fff',
            }}
            title="Pilih foto baru"
          >
            <Camera size={14} />
            <input
              id="edit-avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div>
          <div className="display" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            {username || 'Kelompok 38'}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--steel)' }}>
            Klik ikon kamera untuk mengunggah foto profil baru.
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSaveProfile} className="profile-form">
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="edit-username" className="form-label">
            Callsign / Operator Alias <span className="req">*</span>
          </label>
          <input
            id="edit-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Kelompok 38, Operator Delta..."
            className="form-input"
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="edit-bio" className="form-label">
            Armory Notes / Station Bio
          </label>
          <textarea
            id="edit-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Keahlian, spesialisasi kaliber, info kelompok..."
            rows={4}
            className="form-textarea"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            <Save size={16} /> {saving ? 'Menyimpan…' : 'Simpan Perubahan Profil'}
          </button>
          <button type="button" className="btn btn--outline" onClick={onBack}>
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
