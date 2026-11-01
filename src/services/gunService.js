import { apiClient, IS_SUPABASE } from '../config/api'
import queryCache from '../utils/queryCache'
import { isArchived } from '../utils/archiveStorage'

// ---------------------------------------------------------------------------
// Normalizer — standardizes product shape whether received from Supabase
// (public.products) or from the university API (/api/v1/recipes).
// Supports multiple images & gallery parsing.
// ---------------------------------------------------------------------------
export const normalizeProduct = (item) => {
  if (!item) return null

  // Extract gallery images if stored in specs
  let specsList = []
  const galleryImages = []

  if (Array.isArray(item.specs)) {
    item.specs.forEach((s, idx) => {
      if (typeof s === 'string') {
        if (s.startsWith('Images:') || s.startsWith('Gallery:')) {
          const rawUrls = s.substring(s.indexOf(':') + 1).split(';')
          rawUrls.forEach((u) => {
            const cleanUrl = u.trim()
            if (cleanUrl) galleryImages.push(cleanUrl)
          })
        } else {
          const colonIndex = s.indexOf(':')
          if (colonIndex > -1) {
            specsList.push({
              id: `spec-${idx}`,
              name: s.substring(0, colonIndex).trim(),
              quantity: s.substring(colonIndex + 1).trim(),
            })
          } else {
            specsList.push({
              id: `spec-${idx}`,
              name: 'Specification',
              quantity: s.trim(),
            })
          }
        }
      } else {
        specsList.push(s)
      }
    })
  } else if (Array.isArray(item.ingredients)) {
    specsList = item.ingredients
  }

  // Resolve steps
  const stepsList =
    Array.isArray(item.steps) && item.steps.length > 0
      ? item.steps
      : [
          'Verify firearm is completely unloaded and point in safe direction.',
          'Inspect receiver and mechanism for maintenance.',
        ]

  const primaryImage = item.image_url || item.image || '/guns/pistol.svg'

  // Build unified images array (avoid duplicates)
  const allImages = Array.from(
    new Set([primaryImage, ...galleryImages, ...(Array.isArray(item.images) ? item.images : [])].filter(Boolean)),
  )

  return {
    ...item,
    id: item.id,
    name: item.name || 'Hardware Piece',
    type: item.type || item.category || 'Hardware',
    category: item.type || item.category || 'Hardware',
    caliber: item.caliber || 'Standard',
    price: Number(item.price ?? item.cook_time ?? 0),
    description: item.description || '',
    image_url: primaryImage,
    image: primaryImage,
    images: allImages.length > 0 ? allImages : [primaryImage],
    ingredients: specsList,
    steps: stepsList,
  }
}

// ---------------------------------------------------------------------------
// GunService — wraps backend CRUD endpoints with Query Caching & Soft Delete
// ---------------------------------------------------------------------------
class GunService {
  /**
   * Fetch a paginated, filterable list of products with Query Caching.
   */
  async getGuns(params = {}) {
    const cacheKey = `guns_${JSON.stringify(params)}`

    if (!params.bypassCache) {
      const cached = queryCache.get(cacheKey)
      if (cached) {
        // Filter out archived items unless explicitly requested
        const filtered = params.includeArchived
          ? cached.data
          : cached.data.filter((g) => !isArchived(g.id))
        return {
          ...cached,
          data: filtered,
          pagination: {
            ...cached.pagination,
            total: filtered.length,
          },
        }
      }
    }

    if (IS_SUPABASE) {
      const queryParts = ['select=*']

      if (params.search) {
        queryParts.push(`name=ilike.*${encodeURIComponent(params.search)}*`)
      }

      if (params.category && params.category !== 'All') {
        queryParts.push(`type=eq.${encodeURIComponent(params.category)}`)
      }

      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(`order=${encodeURIComponent(params.sort_by)}.${order}`)
      } else {
        queryParts.push('order=created_at.desc')
      }

      if (params.limit) {
        queryParts.push(`limit=${params.limit}`)
      }

      const queryString = queryParts.join('&')
      const data = await apiClient.get(`/rest/v1/products?${queryString}`)
      const rawList = Array.isArray(data) ? data.map(normalizeProduct) : []

      const result = {
        success: true,
        data: rawList,
        pagination: {
          total: rawList.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }

      // Store in query cache
      queryCache.set(cacheKey, result)

      // Filter out archived items
      const activeList = params.includeArchived
        ? rawList
        : rawList.filter((g) => !isArchived(g.id))

      return {
        ...result,
        data: activeList,
        pagination: {
          ...result.pagination,
          total: activeList.length,
        },
      }
    }

    // Fallback: university REST API
    const clean = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    )
    const response = await apiClient.get('/api/v1/recipes', { params: clean })
    queryCache.set(cacheKey, response)
    return response
  }

  /**
   * Fetch a single product by ID (with caching).
   */
  async getGunById(id, bypassCache = false) {
    const cacheKey = `gun_${id}`
    if (!bypassCache) {
      const cached = queryCache.get(cacheKey)
      if (cached) return cached
    }

    if (IS_SUPABASE) {
      const data = await apiClient.get(`/rest/v1/products?id=eq.${id}&select=*`)
      if (Array.isArray(data) && data.length > 0) {
        const result = { success: true, data: normalizeProduct(data[0]) }
        queryCache.set(cacheKey, result)
        return result
      }
      throw new Error('Hardware item not found.')
    }

    const response = await apiClient.get(`/api/v1/recipes/${id}`)
    queryCache.set(cacheKey, response)
    return response
  }

  /**
   * Helper to serialize multiple images into specs array
   */
  formatSpecsWithGallery(specsInput, imagesInput) {
    const specsArray = Array.isArray(specsInput)
      ? specsInput
          .filter((i) => i && i.name)
          .map((i) => `${i.name}: ${i.quantity}`)
      : []

    if (Array.isArray(imagesInput) && imagesInput.length > 1) {
      // Store secondary images in a special specs entry
      const extraImages = imagesInput.slice(1).join(';')
      specsArray.push(`Images: ${extraImages}`)
    }

    return specsArray
  }

  /**
   * Create a new product.
   */
  async createGun(data) {
    const images = Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : [data.image_url || '/guns/pistol.svg']
    const primaryImage = images[0]

    if (IS_SUPABASE) {
      const specsArray = this.formatSpecsWithGallery(
        data.ingredients || data.specs,
        images,
      )

      const payload = {
        name: data.name,
        type: data.type || (data.category === 'minuman' ? 'Rifle' : 'Pistol'),
        caliber: data.caliber || '9mm',
        price: Number(data.price ?? data.cook_time ?? 0),
        description: data.description || '',
        specs: specsArray,
        image_url: primaryImage,
      }

      const res = await apiClient.post('/rest/v1/products', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res

      // Invalidate cache
      queryCache.invalidate('guns')

      return { success: true, data: normalizeProduct(created) }
    }

    const res = await apiClient.post('/api/v1/recipes', data)
    queryCache.invalidate('guns')
    return res
  }

  /**
   * Update existing product.
   */
  async updateGun(id, data) {
    const images = Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : data.image_url ? [data.image_url] : null

    if (IS_SUPABASE) {
      const payload = {
        updated_at: new Date().toISOString(),
      }
      if (data.name !== undefined) payload.name = data.name
      if (data.type !== undefined) payload.type = data.type
      if (data.caliber !== undefined) payload.caliber = data.caliber
      if (data.price !== undefined || data.cook_time !== undefined) {
        payload.price = Number(data.price ?? data.cook_time ?? 0)
      }
      if (data.description !== undefined) payload.description = data.description

      if (images) {
        payload.image_url = images[0]
      } else if (data.image_url !== undefined) {
        payload.image_url = data.image_url
      }

      if (data.ingredients !== undefined || data.specs !== undefined || images) {
        payload.specs = this.formatSpecsWithGallery(
          data.ingredients || data.specs || [],
          images || [data.image_url],
        )
      }

      const res = await apiClient.patch(`/rest/v1/products?id=eq.${id}`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res

      // Invalidate cache
      queryCache.invalidate('guns')
      queryCache.invalidate(`gun_${id}`)

      return { success: true, data: normalizeProduct(updated) }
    }

    const res = await apiClient.put(`/api/v1/recipes/${id}`, data)
    queryCache.invalidate('guns')
    queryCache.invalidate(`gun_${id}`)
    return res
  }

  /**
   * Partial update (PATCH).
   */
  async patchGun(id, data) {
    if (IS_SUPABASE) {
      return this.updateGun(id, data)
    }
    const res = await apiClient.patch(`/api/v1/recipes/${id}`, data)
    queryCache.invalidate('guns')
    queryCache.invalidate(`gun_${id}`)
    return res
  }

  /**
   * Delete product permanently.
   */
  async deleteGun(id) {
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/products?id=eq.${id}`)
      queryCache.invalidate('guns')
      queryCache.invalidate(`gun_${id}`)
      return { success: true }
    }
    const res = await apiClient.delete(`/api/v1/recipes/${id}`)
    queryCache.invalidate('guns')
    queryCache.invalidate(`gun_${id}`)
    return res
  }
}

export default new GunService()
