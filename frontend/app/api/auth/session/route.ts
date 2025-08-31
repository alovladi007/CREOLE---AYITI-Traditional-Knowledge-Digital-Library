import { cookies } from 'next/headers'

export async function GET() {
  const raw = cookies().get('creole_session')?.value
  if (!raw) return Response.json({ authenticated: false })
  const sess = JSON.parse(raw)
  const now = Math.floor(Date.now()/1000)
  const parts = sess.access_token?.split('.') || []
  let claims: any = {}
  if (parts.length === 3) {
    try { claims = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8')) } catch {}
  }
  const roles = claims?.realm_access?.roles || []
  return Response.json({ authenticated: true, roles, token: sess.access_token })
}