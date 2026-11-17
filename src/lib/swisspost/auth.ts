/**
 * Swiss Post (La Poste Suisse / Die Post) - Digital Commerce API
 * OAuth2 Authentication & Token Cache Manager
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let cachedToken: CachedToken | null = null;

export async function getSwissPostAccessToken(forceRefresh = false): Promise<string> {
  const now = Date.now();

  // Return cached token if valid (with 30s buffer)
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.SWISSPOST_CLIENT_ID || '6f91337ccd79b9c2a7a346780fd1a308';
  const clientSecret = process.env.SWISSPOST_CLIENT_SECRET || '8cc0050c6b6df28d93c040efe5f87af8';
  const tokenUrl = process.env.SWISSPOST_TOKEN_URL || 'https://api.post.ch/OAuth/token';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'DCAPI_BARCODE_READ');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Swiss Post Auth Error]', response.status, errorText);
    throw new Error(`Swiss Post OAuth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 300;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + expiresIn * 1000,
  };

  return cachedToken.accessToken;
}
