import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('creole_session');
  
  let idTokenHint = '';
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      idTokenHint = session.id_token || '';
    } catch {
      // Ignore parsing errors
    }
  }

  const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
  const realm = process.env.KEYCLOAK_REALM || 'creole';
  const postLogoutRedirect = process.env.KEYCLOAK_POST_LOGOUT_REDIRECT || 'http://localhost:3000/';

  const logoutUrl = new URL(`${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout`);
  logoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutRedirect);
  
  if (idTokenHint) {
    logoutUrl.searchParams.set('id_token_hint', idTokenHint);
  }

  const response = NextResponse.redirect(logoutUrl.toString());
  
  // Clear session cookie
  response.cookies.delete('creole_session');

  return response;
}