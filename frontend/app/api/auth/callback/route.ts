import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
  }

  const cookieStore = cookies();
  const savedState = cookieStore.get('auth_state')?.value;
  const codeVerifier = cookieStore.get('code_verifier')?.value;

  if (!savedState || !codeVerifier || state !== savedState) {
    return NextResponse.redirect(new URL('/?error=state_mismatch', request.url));
  }

  try {
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM || 'creole';
    const clientId = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'creole-frontend';
    const redirectUri = process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

    const tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokens = await tokenResponse.json();
    
    const session = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      id_token: tokens.id_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    };

    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set session cookie
    response.cookies.set('creole_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    });
    
    // Clear auth cookies
    response.cookies.delete('auth_state');
    response.cookies.delete('code_verifier');

    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}