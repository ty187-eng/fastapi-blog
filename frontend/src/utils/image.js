const FALLBACK_AVATAR = '/static/profile_pics/default.jpg'

const ABSOLUTE_URL_RE = /^https?:\/\//i

export function resolveImageUrl(path, fallback = FALLBACK_AVATAR) {
  if (!path || typeof path !== 'string') {
    return fallback
  }

  if (ABSOLUTE_URL_RE.test(path)) {
    return path
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || ''

  if (path.startsWith('/')) {
    if (!apiBase) return path
    return `${apiBase.replace(/\/$/, '')}${path}`
  }

  return path
}

export { FALLBACK_AVATAR }
