import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('creole_session');
  
  if (!sessionCookie) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    
    if (!session.refresh_token) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'creole';
    const clientId = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'creole-frontend';

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        refresh_token: session.refresh_token,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token refresh failed');
    }

    const tokens = await tokenResponse.json();
    
    const newSession = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      id_token: tokens.id_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    };

    const response = NextResponse.json({ success: true });
    
    // Update session cookie
    response.cookies.set('creole_session', JSON.stringify(newSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 });
  }
}