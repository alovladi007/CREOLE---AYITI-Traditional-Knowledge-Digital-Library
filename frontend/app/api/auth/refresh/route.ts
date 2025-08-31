import { cookies } from 'next/headers'

export async function POST() {
  const kc = process.env.KEYCLOAK_URL || 'http://keycloak:8080'
  const realm = process.env.KEYCLOAK_REALM || 'creole'
  const clientId = process.env.KEYCLOAK_FRONTEND_CLIENT_ID || 'creole-frontend'

  const raw = cookies().get('creole_session')?.value
  if (!raw) return new Response('no session', { status: 401 })
  const sess = JSON.parse(raw)

  const tokenUrl = `${kc}/realms/${realm}/protocol/openid-connect/token`
  const form = new URLSearchParams()
  form.set('grant_type','refresh_token')
  form.set('refresh_token', sess.refresh_token)
  form.set('client_id', clientId)

  const res = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type':'application/x-www-form-urlencoded' }, body: form })
  if (!res.ok) return new Response('refresh failed', { status: 401 })
  const tokens = await res.json() as any

  const now = Math.floor(Date.now()/1000)
  const expiresAt = now + (tokens.expires_in || 300)

  cookies().set('creole_session', JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || sess.refresh_token,
    id_token: tokens.id_token || sess.id_token,
    expires_at: expiresAt
  }), { httpOnly: true, path: '/' })

  return new Response('ok')
}