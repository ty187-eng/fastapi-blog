const FALLBACK_AVATAR = '/static/profile_pics/default.jpg'

const ABSOLUTE_URL_RE = /^https?:\/\//i

export function resolveImageUrl(path, fallback = FALLBACK_AVATAR) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  const normalizedBase = apiBase.replace(/\/$/, '')

  const withBase = (value) => {
    if (!value || typeof value !== 'string') return value
    if (ABSOLUTE_URL_RE.test(value)) return value
    if (!normalizedBase) return value
    return value.startsWith('/') ? `${normalizedBase}${value}` : `${normalizedBase}/${value}`
  }

  if (!path || typeof path !== 'string') {
    return withBase(fallback)
  }

  return withBase(path)
}

export { FALLBACK_AVATAR }
