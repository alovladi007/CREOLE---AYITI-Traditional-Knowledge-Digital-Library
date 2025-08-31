import { cookies } from 'next/headers';
import { parseJwt } from './oidc';

export interface Session {
  authenticated: boolean;
  roles: string[];
  username?: string;
  token?: string;
}

export async function getSessionServer(): Promise<Session> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('creole_session');
  
  if (!sessionCookie) {
    return { authenticated: false, roles: [] };
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    
    // Check if token is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      return { authenticated: false, roles: [] };
    }

    // Parse roles from access token
    const tokenData = parseJwt(session.access_token);
    const roles = tokenData?.realm_access?.roles || [];
    
    return {
      authenticated: true,
      roles,
      username: tokenData?.preferred_username || tokenData?.email,
      token: session.access_token,
    };
  } catch {
    return { authenticated: false, roles: [] };
  }
}

export async function serverFetch(url: string, init?: RequestInit): Promise<Response> {
  const session = await getSessionServer();
  
  const headers = new Headers(init?.headers);
  
  if (session.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }
  
  return fetch(url, {
    ...init,
    headers,
  });
}