'use client'
import { useEffect, useState } from 'react'

export default function Inbox(){
  const [items, setItems] = useState<any[]>([])
  const [status, setStatus] = useState('')

  async function getToken(){
    const s = await fetch('/api/auth/session').then(r=>r.json())
    return s?.token || null
  }

  async function load(){
    setStatus('')
    try {
      const token = await getToken()
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${base}/v1/access-requests/inbox`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) { setStatus('Unauthorized or error'); return }
      const data = await res.json()
      setItems(Array.isArray(data)?data:[])
    } catch (e:any){
      setStatus('Error: ' + e.message)
    }
  }
  useEffect(()=>{ load() }, [])

  async function decide(id:string, action:'approve'|'deny'){
    const token = await getToken()
    if (!token) { setStatus('Not signed in'); return }
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${base}/v1/access-requests/${id}/${action}`, {
      method:'PATCH',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ note: action==='approve'?'Approved in demo':'Denied in demo' })
    })
    if (!res.ok) { setStatus('Failed'); return }
    await res.json()
    load()
  }

  return (
    <div>
      <h1>Admin Inbox</h1>
      <p>{status}</p>
      <div style={{ display:'grid', gap:8 }}>
        {items.map((it)=> (
          <div key={it.id} style={{ border:'1px solid #eee', padding:10, borderRadius:8 }}>
            <div><strong>{it.purpose}</strong></div>
            <div>Requester: {it.requester} • Record: {it.recordId || '—'} • Status: {it.status}</div>
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <button onClick={()=>decide(it.id,'approve')}>Approve</button>
              <button onClick={()=>decide(it.id,'deny')}>Deny</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}