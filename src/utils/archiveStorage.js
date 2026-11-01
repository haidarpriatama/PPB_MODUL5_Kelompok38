// ---------------------------------------------------------------------------
// archiveStorage.js — Soft delete / archive storage with restore & permanent delete
// ---------------------------------------------------------------------------

const ARCHIVE_KEY = 'bore_barrel_archived_guns'

const getStoredArchive = () => {
  try {
    const raw = localStorage.getItem(ARCHIVE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveStoredArchive = (data) => {
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save archive data:', err)
  }
}

/**
 * Check if an item is soft-deleted / archived
 */
export const isArchived = (id) => {
  if (!id) return false
  const map = getStoredArchive()
  return Boolean(map[String(id)])
}

/**
 * Soft delete (archive) a gun
 */
export const archiveGun = (gun) => {
  if (!gun || !gun.id) return false
  const map = getStoredArchive()
  map[String(gun.id)] = {
    ...gun,
    archivedAt: new Date().toISOString(),
  }
  saveStoredArchive(map)
  return true
}

/**
 * Restore an archived gun
 */
export const restoreGun = (id) => {
  if (!id) return null
  const map = getStoredArchive()
  const restored = map[String(id)]
  if (restored) {
    delete map[String(id)]
    saveStoredArchive(map)
    return restored
  }
  return null
}

/**
 * Remove from archive permanently
 */
export const removePermanentFromArchive = (id) => {
  if (!id) return
  const map = getStoredArchive()
  if (map[String(id)]) {
    delete map[String(id)]
    saveStoredArchive(map)
  }
}

/**
 * Get all archived guns as an array
 */
export const getArchivedGuns = () => {
  const map = getStoredArchive()
  return Object.values(map).sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt))
}

export default {
  isArchived,
  archiveGun,
  restoreGun,
  removePermanentFromArchive,
  getArchivedGuns,
}
