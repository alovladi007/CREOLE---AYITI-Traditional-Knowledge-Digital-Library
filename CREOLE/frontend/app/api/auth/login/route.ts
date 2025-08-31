import { cookies } from 'next/headers'
import { sha256 } from '@/lib/oidc'

export async function GET() {
  const kc = process.env.KEYCLOAK_URL || 'http://localhost:8080'
  const realm = process.env.KEYCLOAK_REALM || 'creole'
  const clientId = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'creole-frontend'
  const redirectUri = process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'

  const state = Math.random().toString(36).slice(2)
  const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>('0'+b.toString(16)).slice(-2)).join('')
  const challenge = await sha256(verifier)

  cookies().set('oidc_state', state, { httpOnly: true, path: '/' })
  cookies().set('oidc_verifier', verifier, { httpOnly: true, path: '/' })

  const url = new URL(`${kc}/realms/${realm}/protocol/openid-connect/auth`)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')

  return Response.redirect(url.toString(), 302)
}