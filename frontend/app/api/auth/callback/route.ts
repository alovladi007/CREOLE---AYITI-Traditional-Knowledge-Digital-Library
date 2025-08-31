import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code') || ''
  const state = url.searchParams.get('state') || ''
  const savedState = cookies().get('oidc_state')?.value
  const verifier = cookies().get('oidc_verifier')?.value
  if (!code || !state || !savedState || state !== savedState || !verifier) {
    return new Response('Invalid OIDC state', { status: 400 })
  }

  // Use keycloak service name when running in Docker
  const kc = process.env.KEYCLOAK_URL || 'http://keycloak:8080'
  const realm = process.env.KEYCLOAK_REALM || 'creole'
  const clientId = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'creole-frontend'
  const redirectUri = process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'

  const tokenUrl = `${kc}/realms/${realm}/protocol/openid-connect/token`
  const form = new URLSearchParams()
  form.set('grant_type','authorization_code')
  form.set('code', code)
  form.set('client_id', clientId)
  form.set('redirect_uri', redirectUri)
  form.set('code_verifier', verifier)

  const res = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' }, body: form })
  if (!res.ok) return new Response('Token exchange failed', { status: 400 })
  const tokens = await res.json() as any

  const now = Math.floor(Date.now()/1000)
  const expiresAt = now + (tokens.expires_in || 300)

  cookies().set('creole_session', JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    id_token: tokens.id_token,
    expires_at: expiresAt
  }), { httpOnly: true, path: '/' })

  // cleanup
  cookies().delete('oidc_state'); 
  cookies().delete('oidc_verifier')

  return Response.redirect('/', 302)
}