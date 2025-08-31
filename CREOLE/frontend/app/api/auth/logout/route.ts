import { cookies } from 'next/headers'

export async function GET() {
  const kc = process.env.KEYCLOAK_URL || 'http://localhost:8080'
  const realm = process.env.KEYCLOAK_REALM || 'creole'
  const redirect = process.env.KEYCLOAK_POST_LOGOUT_REDIRECT || 'http://localhost:3000/'
  cookies().delete('creole_session')
  const url = new URL(`${kc}/realms/${realm}/protocol/openid-connect/logout`)
  url.searchParams.set('post_logout_redirect_uri', redirect)
  return Response.redirect(url.toString(), 302)
}