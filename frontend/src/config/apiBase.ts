/**
 * API base for axios: empty string in dev uses Vite proxy (same origin as the UI).
 * Set VITE_API_URL to call the backend directly (e.g. http://localhost:8081).
 */
export function getApiBaseUrl(): string {
  const v = import.meta.env.VITE_API_URL as string | undefined
  if (v != null && String(v).trim() !== '') {
    return String(v).replace(/\/$/, '')
  }
  if (import.meta.env.DEV) {
    return ''
  }
  return 'http://localhost:8080'
}

/**
 * Origin for browser redirects (Google OAuth). Not proxied by fetch; must be real backend URL.
 */
export function getOAuthBaseUrl(): string {
  const o = import.meta.env.VITE_BACKEND_ORIGIN as string | undefined
  if (o != null && String(o).trim() !== '') {
    return String(o).replace(/\/$/, '')
  }
  const direct = import.meta.env.VITE_API_URL as string | undefined
  if (direct != null && String(direct).trim() !== '') {
    return String(direct).replace(/\/$/, '')
  }
  // Fallback: use the backend port directly (OAuth cannot go through the Vite proxy)
  return import.meta.env.DEV ? 'http://localhost:8080' : ''
}

export function getWebSocketResourcesUrl(): string {
  const base = getApiBaseUrl()
  if (!base) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}/ws/resources`
  }
  const wsBase = base
    .replace(/^https:\/\//i, 'wss://')
    .replace(/^http:\/\//i, 'ws://')
  return `${wsBase.replace(/\/$/, '')}/ws/resources`
}
