// Network URL resolver for student devices (QR Code & Link sharing)

export const DEFAULT_LAN_IP = '192.168.40.32';
export const DEFAULT_PORT = '5173';

// In-memory cache for dynamically detected tunnel
let cachedDynamicTunnel = '';

/**
 * Detects if the user is currently browsing from a public Cloudflare or HTTPS domain
 */
export function getActiveBrowserOrigin() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    const host = window.location.hostname;
    // If running on a public tunnel (trycloudflare.com or any non-local hostname)
    if (
      host !== 'localhost' && 
      host !== '127.0.0.1' && 
      !host.startsWith('192.168.') && 
      !host.startsWith('10.') &&
      !host.startsWith('172.')
    ) {
      return origin;
    }
  }
  return null;
}

/**
 * Gets preferred URL mode: 'tunnel' (HTTPS Cloudflare, works on all cellphones) or 'lan' (Local Wi-Fi)
 */
export function getUrlMode() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('aprende_url_mode');
    if (saved === 'lan' || saved === 'tunnel') return saved;
  }
  return 'tunnel';
}

export function setUrlMode(mode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aprende_url_mode', mode);
  }
}

/**
 * Sets a custom tunnel URL manually
 */
export function setCustomTunnel(url) {
  const clean = (url || '').trim().replace(/\/$/, '');
  cachedDynamicTunnel = clean;
  if (typeof localStorage !== 'undefined') {
    if (clean) {
      localStorage.setItem('aprende_custom_tunnel', clean);
    } else {
      localStorage.removeItem('aprende_custom_tunnel');
    }
  }
  return clean;
}

/**
 * Synchronizes and discovers the live tunnel URL from server
 */
export async function syncActiveTunnel() {
  // 1. If currently on a public tunnel, that's already the real URL
  const browserOrigin = getActiveBrowserOrigin();
  if (browserOrigin) {
    cachedDynamicTunnel = browserOrigin;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aprende_custom_tunnel', browserOrigin);
    }
    return browserOrigin;
  }

  // 2. Fetch from backend /api/tunnel
  try {
    const res = await fetch('/api/tunnel');
    if (res.ok) {
      const data = await res.json();
      if (data.tunnelUrl) {
        cachedDynamicTunnel = data.tunnelUrl;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('aprende_custom_tunnel', data.tunnelUrl);
        }
        return data.tunnelUrl;
      }
    }
  } catch (e) {}

  // 3. Fallback: fetch from /network-config.json
  try {
    const res = await fetch(`/network-config.json?_t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tunnelUrl) {
        cachedDynamicTunnel = data.tunnelUrl;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('aprende_custom_tunnel', data.tunnelUrl);
        }
        return data.tunnelUrl;
      }
    }
  } catch (e) {}

  return cachedDynamicTunnel || '';
}

/**
 * Returns the full student join URL based on mode
 */
export function getPhoneNetworkUrl(path = '', forceMode = null, explicitTunnel = null) {
  const mode = forceMode || getUrlMode();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  // Mode 1: Cloudflare Tunnel HTTPS
  if (mode === 'tunnel') {
    // 1st priority: Explicit tunnel passed from component state
    if (explicitTunnel) {
      return `${explicitTunnel.replace(/\/$/, '')}${cleanPath}`;
    }

    // 2nd priority: Current browser origin if not localhost
    const browserOrigin = getActiveBrowserOrigin();
    if (browserOrigin) {
      return `${browserOrigin}${cleanPath}`;
    }

    // 3rd priority: In-memory dynamic tunnel
    if (cachedDynamicTunnel) {
      return `${cachedDynamicTunnel.replace(/\/$/, '')}${cleanPath}`;
    }

    // 4th priority: Custom saved tunnel in localStorage
    const customTunnel = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('aprende_custom_tunnel') 
      : null;
    if (customTunnel) {
      return `${customTunnel.replace(/\/$/, '')}${cleanPath}`;
    }

    // Default fallback
    return `https://arrivals-though-hung-barbara.trycloudflare.com${cleanPath}`;
  }

  // Mode 2: Local LAN Wi-Fi
  const customIp = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('aprende_custom_ip') 
    : null;
  const lanHost = customIp || DEFAULT_LAN_IP;
  const port = `:${DEFAULT_PORT}`;

  return `http://${lanHost}${port}${cleanPath}`;
}
