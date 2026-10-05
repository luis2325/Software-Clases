// Network URL resolver for student devices (QR Code & Link sharing)

export const DEFAULT_TUNNEL_URL = 'https://fun-univ-song-batch.trycloudflare.com';
export const DEFAULT_LAN_IP = '192.168.40.32';
export const DEFAULT_PORT = '5173';

/**
 * Gets preferred URL mode: 'tunnel' (HTTPS Cloudflare, works on all cellphones) or 'lan' (Local Wi-Fi)
 */
export function getUrlMode() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('aprende_url_mode');
    if (saved === 'lan' || saved === 'tunnel') return saved;
  }
  // Default to tunnel because it bypasses local firewall and works on any phone/data plan!
  return 'tunnel';
}

export function setUrlMode(mode) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aprende_url_mode', mode);
  }
}

/**
 * Returns the full student join URL based on mode
 */
export function getPhoneNetworkUrl(path = '', forceMode = null) {
  const mode = forceMode || getUrlMode();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  // Mode 1: Cloudflare Tunnel HTTPS (zero firewall issues, works on any cellular network or Wi-Fi)
  if (mode === 'tunnel') {
    const customTunnel = typeof localStorage !== 'undefined' 
      ? localStorage.getItem('aprende_custom_tunnel') 
      : null;
    const baseTunnel = customTunnel || DEFAULT_TUNNEL_URL;
    return `${baseTunnel.replace(/\/$/, '')}${cleanPath}`;
  }

  // Mode 2: Local LAN Wi-Fi
  const customIp = typeof localStorage !== 'undefined' 
    ? localStorage.getItem('aprende_custom_ip') 
    : null;
  const lanHost = customIp || DEFAULT_LAN_IP;
  const port = `:${DEFAULT_PORT}`;

  return `http://${lanHost}${port}${cleanPath}`;
}
