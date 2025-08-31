import { cookies } from 'next/headers'

export async function getSessionServer() {
  const raw = cookies().get('creole_session')?.value
  if (!raw) return { authenticated:false, roles:[], token:null }
  const sess = JSON.parse(raw)
  const now = Math.floor(Date.now()/1000)
  const parts = (sess.access_token||'').split('.')
  let claims:any = {}
  if (parts.length===3){
    try { claims = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8')) } catch {}
  }
  const roles = claims?.realm_access?.roles || []
  return { authenticated:true, roles, token: sess.access_token }
}

export async function serverFetch(input: string, init: any = {}){
  const sess = await getSessionServer()
  const headers = new Headers(init.headers || {})
  if (sess.token) headers.set('Authorization', `Bearer ${sess.token}`)
  return fetch(input, { ...init, headers })
}